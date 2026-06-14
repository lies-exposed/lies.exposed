import { fetchDomainSpecificMetadata } from "@liexp/backend/lib/providers/URLMetadata.provider.js";
import { AgentChatService } from "@liexp/backend/lib/services/agent-chat/agent-chat.service.js";
import { LoggerService } from "@liexp/backend/lib/services/logger/logger.service.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { URL } from "@liexp/io/lib/http/Common/index.js";
import {
  type CreateQueueEmbeddingTypeData,
  CreateQueueTextData,
  CreateQueueURLData,
} from "@liexp/io/lib/http/Queue/index.js";
import axios from "axios";
import { Schema } from "effect";
import { toAIBotError } from "../../../common/error/index.js";
import { type ClientContext } from "../../../context.js";
import { getPromptForJob } from "../prompts.js";
import { type JobProcessRTE } from "#services/job-processor/job-processor.service.js";

const defaultQuestion = `Return the requested information in JSON format with fields: title (string), description (string), publishDate (string in 'YYYY-MM-DD' format or empty string if not published).`;

const UpdateLinkStructuredResponse = Schema.Struct({
  title: Schema.String.annotations({
    description: "The title of the link",
  }),
  description: Schema.String.annotations({
    description: "The description of the link",
  }),
  publishDate: Schema.String.annotations({
    description:
      "The date the content was published in 'YYYY-MM-DD' format (empty string if not published, fallback to 1st day of the year if unknown)",
  }),
  thumbnailUrl: Schema.NullOr(URL).annotations({
    description:
      "Absolute URL of the main representative image (og:image, Twitter card, or prominent article image). Null if not found.",
  }),
});
type UpdateLinkStructuredResponse = typeof UpdateLinkStructuredResponse.Type;

const isURLData = (
  data: (typeof CreateQueueEmbeddingTypeData.Type)["data"],
): data is typeof CreateQueueURLData.Type =>
  Schema.is(CreateQueueURLData)(data);

const isTextData = (
  data: (typeof CreateQueueEmbeddingTypeData.Type)["data"],
): data is typeof CreateQueueTextData.Type =>
  Schema.is(CreateQueueTextData)(data);

const getPageContentRTE = (
  ctx: ClientContext,
  data: (typeof CreateQueueEmbeddingTypeData.Type)["data"],
) => {
  if (isURLData(data) && data.url) {
    const url = data.url;

    // Fallback: generic puppeteer scrape for pages without a provider API.
    const fromPuppeteer = pipe(
      ctx.puppeteer.getBrowserFirstPage(url, {
        defaultViewport: { width: 1280, height: 800 },
      }),
      fp.TE.chain((page) =>
        fp.TE.tryCatch(
          async () => {
            await page.setUserAgent(
              "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            );
            await page.setExtraHTTPHeaders({
              Accept:
                "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
              "Accept-Language": "en-US,en;q=0.9",
            });
            await page.goto(url, {
              waitUntil: "networkidle0",
              timeout: 30000,
            });
            await page
              .waitForSelector("body", { timeout: 2000 })
              .catch(() => {});
            const { title, content } = await page.evaluate(() => {
              const meta = (sel: string): string =>
                document.querySelector(sel)?.getAttribute("content")?.trim() ??
                "";
              const text = (el: Element | null): string =>
                el?.textContent?.replace(/\s+/g, " ").trim() ?? "";

              // Title: prefer the article heading / og:title / citation_title
              // over document.title, which on many platforms is the site name
              // (e.g. "PubMed") rather than the article title.
              const siteName = meta("meta[property='og:site_name']");
              let title =
                text(document.querySelector("h1")) ||
                meta("meta[property='og:title']") ||
                meta("meta[name='citation_title']") ||
                (document.title || "").trim();
              // Strip a trailing " - SiteName" / " | SiteName" suffix.
              if (siteName) {
                title = title
                  .replace(new RegExp(`\\s*[-|–—]\\s*${siteName}\\s*$`), "")
                  .trim();
              }

              // Description from article-specific meta tags (the real abstract
              // on academic pages, og:description on articles). This is the
              // strongest signal and is included up front so the model gets the
              // article content even when body extraction is weak.
              const metaDescription =
                meta("meta[name='citation_abstract']") ||
                meta("meta[name='description']") ||
                meta("meta[property='og:description']");

              const body = document.body;
              let articleText = "";
              if (body) {
                // Article-specific containers first, generic page regions last,
                // so we capture the article rather than the whole page shell.
                const selectors = [
                  ".abstract-content",
                  "#abstract",
                  ".abstract",
                  ".abstract-section",
                  "article",
                  "[role='main']",
                  "main",
                ];
                for (const sel of selectors) {
                  const el = body.querySelector(sel);
                  const t = text(el);
                  if (t.length > 50) {
                    articleText = t;
                    break;
                  }
                }
                if (articleText.length < 50) {
                  const clone = body.cloneNode(true) as HTMLElement;
                  for (const el of clone.querySelectorAll(
                    "nav, footer, header, aside, script, style",
                  )) {
                    el.parentNode?.removeChild(el);
                  }
                  articleText = text(clone);
                }
              }

              const content = [metaDescription, articleText]
                .filter(Boolean)
                .join("\n\n");
              return {
                title,
                content:
                  content.length > 8000
                    ? content.substring(0, 8000) + "\n\n[Content truncated...]"
                    : content,
              };
            });
            await page.close();
            return { title, content, publishDate: null };
          },
          (e) => (e instanceof Error ? e : new Error(String(e))),
        ),
      ),
      fp.TE.mapLeft(toAIBotError),
    );

    // Provider-specific extraction first: for known providers (PubMed/PMC,
    // CrossRef DOIs, archive.org) query the authoritative API for title +
    // abstract instead of scraping a JS app shell that yields the platform
    // name/blurb. Falls back to puppeteer when no provider matches.
    return pipe(
      fp.TE.fromTask(() => fetchDomainSpecificMetadata(axios, url)),
      fp.TE.mapLeft(toAIBotError),
      fp.TE.chain((dm) =>
        dm?.title && dm.description
          ? fp.TE.right({
              title: dm.title,
              content: dm.description,
              // Authoritative publish date from the provider API — the abstract
              // text rarely contains it, so the model can't recover it.
              publishDate: dm.date ? new Date(dm.date) : null,
            })
          : fromPuppeteer,
      ),
      fp.RTE.fromTaskEither,
    );
  }
  return pipe(
    fp.TE.right({
      content: isTextData(data) ? data.text : "",
      title: "",
      publishDate: null as Date | null,
    }),
    fp.RTE.fromTaskEither,
  );
};

const transformResult = (result: UpdateLinkStructuredResponse) => ({
  title: result.title,
  description: result.description,
  publishDate: result.publishDate !== "" ? new Date(result.publishDate) : null,
  thumbnailUrl: result.thumbnailUrl,
});

export const updateLinkFlow: JobProcessRTE<
  CreateQueueEmbeddingTypeData,
  {
    title: string;
    description: string;
    publishDate: Date | null;
    thumbnailUrl: URL | null;
  }
> = (job) => {
  const data = job.data;

  return pipe(
    fp.RTE.Do,
    fp.RTE.bindW("ctx", () => fp.RTE.ask<ClientContext>()),
    fp.RTE.bindW("prompt", () => fp.RTE.right(getPromptForJob(job))),
    fp.RTE.bindW("pageContent", ({ ctx }) => getPageContentRTE(ctx, data)),
    fp.RTE.bind("result", ({ prompt, pageContent }) =>
      pipe(
        AgentChatService.getStructuredOutput<
          ClientContext,
          UpdateLinkStructuredResponse
        >({
          message: `${prompt({
            vars: {
              text: [pageContent.title, pageContent.content]
                .filter(Boolean)
                .join("\n\n"),
            },
          })}\n\n${job.question ?? defaultQuestion}`,
          model: job.model ?? undefined,
        }),
        fp.RTE.mapLeft(toAIBotError),
      ),
    ),
    LoggerService.RTE.debug("Messages %O"),
    fp.RTE.map(({ result, pageContent }) => {
      const base = transformResult(result);
      // Provider-supplied date is authoritative; fall back to the model's.
      return {
        ...base,
        publishDate: pageContent.publishDate ?? base.publishDate,
      };
    }),
  );
};
