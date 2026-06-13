import { AgentChatService } from "@liexp/backend/lib/services/agent-chat/agent-chat.service.js";
import { LoggerService } from "@liexp/backend/lib/services/logger/logger.service.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { URL } from "@liexp/io/lib/http/Common/index.js";
import {
  CreateQueueEmbeddingTypeData,
  CreateQueueTextData,
  CreateQueueURLData,
} from "@liexp/io/lib/http/Queue/index.js";
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

type PageContent = {
  content: string;
  title: string;
};

const cleanHTML = (html: string): PageContent => {
  const titleMatch = /<title[^>]*>([^<]+)<\/title>/i.exec(html);
  const title = titleMatch ? titleMatch[1].trim() : "";

  let cleaned = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, "")
    .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, "")
    .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, "")
    .replace(/<aside[^>]*>[\s\S]*?<\/aside>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "");
  cleaned = cleaned.replace(
    /<h([1-6])[^>]*>([^<]+)<\/h[1-6]>/gi,
    (_: string, level: string, text: string) =>
      `\n\n${"#".repeat(parseInt(level, 10))} ${text.trim()}\n\n`,
  );
  cleaned = cleaned.replace(/<p[^>]*>([^<]*)<\/p>/gi, "\n\n$1\n\n");
  cleaned = cleaned.replace(/<br\s*\/?>/gi, "\n");
  cleaned = cleaned.replace(/<div[^>]*>/gi, "\n");
  cleaned = cleaned.replace(/<\/div>/gi, "\n");
  cleaned = cleaned.replace(/<[^>]+>/g, " ");
  cleaned = cleaned
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#(39|34);/g, "'")
    .replace(/\n\s*\n\s*\n/g, "\n\n")
    .replace(/[ \t]+/g, " ")
    .trim();

  return {
    content:
      cleaned.length > 8000
        ? cleaned.substring(0, 8000) + "\n\n[Content truncated...]"
        : cleaned,
    title,
  };
};

const getPageContentRTE = (
  ctx: ClientContext,
  data: (typeof CreateQueueEmbeddingTypeData.Type)["data"],
) => {
  if (isURLData(data) && data.url) {
    return pipe(
      ctx.puppeteer.getBrowserFirstPage(data.url, {
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
            await page.goto(data.url, {
              waitUntil: "networkidle0",
              timeout: 30000,
            });
            await page
              .waitForSelector("body", { timeout: 2000 })
              .catch(() => {});
            const html = await page.content();
            await page.close();
            return cleanHTML(html);
          },
          (e) => (e instanceof Error ? e : new Error(String(e))),
        ),
      ),
      fp.TE.mapLeft(toAIBotError),
      fp.RTE.fromTaskEither,
    );
  }
  return pipe(
    fp.TE.right({
      content: isTextData(data) ? data.text : "",
      title: "",
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
              text: pageContent.content ?? "",
            },
          })}\n\n${job.question ?? defaultQuestion}`,
          model: job.model ?? undefined,
        }),
        fp.RTE.mapLeft(toAIBotError),
      ),
    ),
    LoggerService.RTE.debug("Messages %O"),
    fp.RTE.map(({ result }) => transformResult(result)),
  );
};
