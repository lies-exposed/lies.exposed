import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { effectToZod } from "@liexp/shared/lib/utils/schema.utils.js";
import axios from "axios";
import { Schema } from "effect/index";
import { tool } from "langchain";
import { parseHTML } from "linkedom";
import { type LoggerContext } from "../../../context/logger.context.js";
import { type PuppeteerProviderContext } from "../../../context/puppeteer.context.js";
import {
  fetchDomainSpecificMetadata,
  fetchWaybackSnapshotContent,
} from "../../URLMetadata.provider.js";
import { toPuppeteerError } from "../../puppeteer.provider.js";

const collapseWhitespace = (text: string): string =>
  text
    .replace(/\n\s*\n\s*\n/g, "\n\n") // collapse 3+ newlines to a paragraph break
    .replace(/[ \t]+/g, " ")
    .trim();

/**
 * Enhanced content extraction optimized for LLM consumption.
 * Uses linkedom for a real DOM parse — textContent decodes entities natively.
 */
const extractStructuredContentFromHTML = (
  html: string,
): {
  title: string;
  headings: { level: number; text: string }[];
  content: string;
  links: { text: string; href: string }[];
  listItems: string[];
} => {
  const { document } = parseHTML(html);

  document
    .querySelectorAll("script, style, noscript")
    .forEach((el) => el.remove());

  const title = document.querySelector("title")?.textContent?.trim() ?? "";

  const headings = Array.from(
    document.querySelectorAll("h1, h2, h3, h4, h5, h6"),
  )
    .map((el) => ({
      level: Number(el.tagName[1]),
      text: (el.textContent ?? "").trim(),
    }))
    .filter((h) => h.text);

  const links = Array.from(document.querySelectorAll("a[href]"))
    .map((el) => ({
      href: el.getAttribute("href") ?? "",
      text: (el.textContent ?? "").trim(),
    }))
    .filter((l) => l.text && l.href);

  const listItems = Array.from(document.querySelectorAll("li"))
    .map((el) => (el.textContent ?? "").replace(/\s+/g, " ").trim())
    .filter(Boolean);

  // Mark up headings inline so the flat textContent keeps hierarchy.
  document.querySelectorAll("h1, h2, h3, h4, h5, h6").forEach((el) => {
    const hashes = "#".repeat(Number(el.tagName[1]));
    el.textContent = `\n\n${hashes} ${(el.textContent ?? "").trim()}\n\n`;
  });

  const body = document.querySelector("body") ?? document;
  const content = collapseWhitespace(body.textContent ?? "");

  return { title, headings, content, links, listItems };
};

/**
 * Extract comprehensive metadata from HTML optimized for LLM context
 */
const extractComprehensiveMetadata = (
  html: string,
): {
  basic: Record<string, string>;
  openGraph: Record<string, string>;
  twitterCard: Record<string, string>;
  jsonLd: any[];
  lang: string;
  canonicalUrl?: string;
} => {
  const { document } = parseHTML(html);

  const basic: Record<string, string> = {};
  const openGraph: Record<string, string> = {};
  const twitterCard: Record<string, string> = {};
  const jsonLd: any[] = [];

  const title = document.querySelector("title")?.textContent?.trim();
  if (title) basic.title = title;

  const lang =
    document.querySelector("html")?.getAttribute("lang")?.trim() ?? "en";

  const canonicalUrl =
    document.querySelector('link[rel="canonical"]')?.getAttribute("href") ??
    undefined;

  document.querySelectorAll("meta").forEach((el) => {
    const name = (
      el.getAttribute("name") ?? el.getAttribute("property")
    )?.toLowerCase();
    const content = el.getAttribute("content");
    if (!name || content == null) return;

    if (name.startsWith("og:")) {
      openGraph[name] = content;
    } else if (name.startsWith("twitter:")) {
      twitterCard[name] = content;
    } else {
      basic[name] = content;
    }
  });

  document
    .querySelectorAll('script[type="application/ld+json"]')
    .forEach((el) => {
      try {
        jsonLd.push(JSON.parse(el.textContent ?? ""));
      } catch {
        // Skip invalid JSON-LD
      }
    });

  return {
    basic,
    openGraph,
    twitterCard,
    jsonLd,
    lang,
    canonicalUrl,
  };
};

/**
 * Smart content chunking that preserves structure and important information
 */
const intelligentTruncate = (content: string, maxLength: number): string => {
  if (content.length <= maxLength) {
    return content;
  }

  // Try to find a good breaking point (end of paragraph, sentence, etc.)
  const breakPoints = [
    content.lastIndexOf("\n\n", maxLength),
    content.lastIndexOf(".", maxLength),
    content.lastIndexOf("!", maxLength),
    content.lastIndexOf("?", maxLength),
    content.lastIndexOf(";", maxLength),
  ].filter((pos) => pos > maxLength * 0.7); // Only consider break points in the last 30%

  const breakPoint = Math.max(...breakPoints);

  if (breakPoint > 0) {
    return (
      content.substring(0, breakPoint + 1) +
      "\n\n[Content truncated for length - original continues...]"
    );
  }

  // Fallback to simple truncation
  return (
    content.substring(0, maxLength - 50) + "... [Content truncated for length]"
  );
};

/**
 * Format extracted data for optimal LLM consumption
 */
const formatForLLM = (
  url: string,
  structuredContent: ReturnType<typeof extractStructuredContentFromHTML>,
  metadata: ReturnType<typeof extractComprehensiveMetadata>,
  includeMetadata: boolean,
  maxLength: number,
): string => {
  const sections: string[] = [];

  // Header with URL and title
  sections.push(`# Web Page Analysis\n\n**URL:** ${url}`);

  if (structuredContent.title) {
    sections.push(`**Title:** ${structuredContent.title}`);
  }

  // Basic metadata if requested
  if (includeMetadata) {
    if (metadata.basic.description) {
      sections.push(`**Description:** ${metadata.basic.description}`);
    }

    if (metadata.lang !== "en") {
      sections.push(`**Language:** ${metadata.lang}`);
    }

    if (metadata.canonicalUrl && metadata.canonicalUrl !== url) {
      sections.push(`**Canonical URL:** ${metadata.canonicalUrl}`);
    }

    // Open Graph data for social context
    if (Object.keys(metadata.openGraph).length > 0) {
      sections.push("**Open Graph Data:**");
      Object.entries(metadata.openGraph).forEach(([key, value]) => {
        sections.push(`  - ${key}: ${value}`);
      });
    }

    // JSON-LD structured data for semantic context
    if (metadata.jsonLd.length > 0) {
      sections.push("**Structured Data:**");
      metadata.jsonLd.forEach((data) => {
        if (data["@type"]) {
          sections.push(`  - Type: ${data["@type"]}`);
          if (data.name) sections.push(`    Name: ${data.name}`);
          if (data.description)
            sections.push(`    Description: ${data.description}`);
        }
      });
    }
  }

  // Content structure overview
  if (structuredContent.headings.length > 0) {
    sections.push("**Content Structure:**");
    structuredContent.headings.forEach((heading) => {
      const indent = "  ".repeat(heading.level - 1);
      sections.push(`${indent}- ${heading.text}`);
    });
  }

  // Main content
  sections.push("**Main Content:**");
  sections.push(structuredContent.content);

  // Important links if any
  if (structuredContent.links.length > 0) {
    sections.push("**Important Links:**");
    const uniqueLinks = structuredContent.links
      .filter(
        (link, index, arr) =>
          arr.findIndex((l) => l.href === link.href) === index,
      )
      .slice(0, 10); // Limit to first 10 unique links

    uniqueLinks.forEach((link) => {
      sections.push(`  - [${link.text}](${link.href})`);
    });
  }

  // Key points from lists
  if (structuredContent.listItems.length > 0) {
    sections.push("**Key Points:**");
    structuredContent.listItems.slice(0, 20).forEach((item) => {
      sections.push(`  • ${item}`);
    });
  }

  const fullContent = sections.join("\n\n");
  return intelligentTruncate(fullContent, maxLength);
};

const ScrapeWebpageInputSchema = Schema.Struct({
  url: Schema.String,
  includeMetadata: Schema.UndefinedOr(Schema.Boolean).annotations({
    description: "Include comprehensive metadata for context",
  }),
  maxLength: Schema.UndefinedOr(Schema.Number).annotations({
    description: "Maximum content length (defaults to 15000 chars)",
  }),
  waitForNetworkIdle: Schema.UndefinedOr(Schema.Boolean).annotations({
    description:
      "Wait for network idle before extracting content (default false; only for pages that render content late — many news sites never go idle and time out)",
  }),
});

type ScrapeWebPageInputSchema = typeof ScrapeWebpageInputSchema.Type;

const scrapeWebPageInput = effectToZod(ScrapeWebpageInputSchema);

/**
 * Creates a web scraping tool optimized for LLM consumption
 */
// Caps retries against a URL that keeps failing (e.g. bot-blocked navigation
// timeouts). Without this the agent's tool-calling loop just keeps re-invoking
// the tool on the same doomed URL until recursionLimit, each attempt costing
// a real ~30-90s browser launch+timeout — tying up the calling job (and its
// HTTP request, which has no independent timeout) for tens of minutes.
const MAX_CONSECUTIVE_FAILURES_PER_URL = 2;
const consecutiveFailuresByUrl = new Map<string, number>();

// Below this, the extracted main content is treated as a bot-block / error
// page rather than the real article.
const MIN_MAIN_CONTENT_LENGTH = 200;

/**
 * Fallbacks when the live browser scrape fails or returns a bot-block page:
 * 1. provider APIs (PubMed/PMC, CrossRef DOIs, archive.org) for title+abstract
 * 2. the latest Wayback Machine snapshot (fetched by archive.org, not our
 *    infra, so it sidesteps live bot-detection)
 */
const scrapeFallback = async (
  url: string,
  maxLength: number,
): Promise<string | null> => {
  const domain = await fetchDomainSpecificMetadata(axios, url).catch(
    () => null,
  );
  if (domain?.title && domain.description) {
    return intelligentTruncate(
      [
        `# Web Page Analysis\n\n**URL:** ${url}`,
        "**Source:** provider API",
        `**Title:** ${domain.title}`,
        domain.date ? `**Published:** ${String(domain.date)}` : null,
        "**Main Content:**",
        domain.description,
      ]
        .filter(Boolean)
        .join("\n\n"),
      maxLength,
    );
  }

  const snapshot = await fetchWaybackSnapshotContent(axios, url).catch(
    () => null,
  );
  if (
    snapshot &&
    (snapshot.title + snapshot.content).trim().length >= MIN_MAIN_CONTENT_LENGTH
  ) {
    return intelligentTruncate(
      [
        `# Web Page Analysis\n\n**URL:** ${url}`,
        "**Source:** Wayback Machine snapshot (live page was unavailable)",
        snapshot.title ? `**Title:** ${snapshot.title}` : null,
        "**Main Content:**",
        snapshot.content,
      ]
        .filter(Boolean)
        .join("\n\n"),
      maxLength,
    );
  }

  return null;
};

export const createWebScrapingTool = <
  C extends PuppeteerProviderContext & LoggerContext,
>(
  ctx: C,
) => {
  const scrapeFunction = async (
    input: ScrapeWebPageInputSchema,
  ): Promise<string> => {
    const {
      url,
      includeMetadata = true,
      maxLength = 15000,
      waitForNetworkIdle = false,
    } = input;

    if (!url) {
      throw new Error("URL is required");
    }

    const priorFailures = consecutiveFailuresByUrl.get(url) ?? 0;
    if (priorFailures >= MAX_CONSECUTIVE_FAILURES_PER_URL) {
      return (
        `Error scraping ${url}: gave up after ${priorFailures} failed attempts ` +
        `(navigation timeout / bot-blocked). Do not retry this URL — report ` +
        `that the page content is unavailable.`
      );
    }

    const task = pipe(
      ctx.puppeteer.execute(
        { defaultViewport: { width: 1280, height: 800 } },
        (browser) => {
          return pipe(
            fp.TE.tryCatch(async () => {
              const page = await browser.newPage();

              // No manual UA override: the stealth plugin (puppeteer.load.ts)
              // already sets a UA consistent with the Chromium build's Client
              // Hints headers; a hardcoded UA desyncs them, which is itself a
              // bot-detection signal.

              // Set additional headers to mimic real browser
              await page.setExtraHTTPHeaders({
                Accept:
                  "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
                "Accept-Language": "en-US,en;q=0.9",
                "Accept-Encoding": "gzip, deflate, br",
                Connection: "keep-alive",
                "Upgrade-Insecure-Requests": "1",
                "Sec-Fetch-Dest": "document",
                "Sec-Fetch-Mode": "navigate",
                "Sec-Fetch-Site": "none",
                "Sec-Fetch-User": "?1",
                "Cache-Control": "max-age=0",
              });

              // Navigate to the page
              const waitUntilOption = waitForNetworkIdle
                ? "networkidle0"
                : "domcontentloaded";
              ctx.logger.debug.log(`Navigating to URL: ${url}`);
              await page.goto(url, {
                waitUntil: waitUntilOption,
                timeout: 30000,
              });

              // Short settle delay for client-rendered content.
              await page
                .waitForSelector("body", { timeout: 2000 })
                .catch(() => {
                  // Ignore timeout, continue anyway
                });
              if (!waitForNetworkIdle) {
                await new Promise((resolve) => setTimeout(resolve, 1500));
              }

              ctx.logger.debug.log(`Extracting content from URL: ${url}`);
              // Get the full HTML content
              const html = await page.content();

              return html;
            }, toPuppeteerError),
            fp.TE.chain((html) => {
              // Extract structured content and metadata
              const structuredContent = extractStructuredContentFromHTML(html);
              const metadata = extractComprehensiveMetadata(html);

              if (structuredContent.content.length < MIN_MAIN_CONTENT_LENGTH) {
                return fp.TE.left(
                  toPuppeteerError(
                    new Error(
                      `page content too short (${String(structuredContent.content.length)} chars) — likely bot-blocked or an error page`,
                    ),
                  ),
                );
              }

              // Format for LLM consumption
              return fp.TE.right(
                formatForLLM(
                  url,
                  structuredContent,
                  metadata,
                  includeMetadata,
                  maxLength,
                ),
              );
            }),
          );
        },
      ),
      fp.TE.orElseW((e) => {
        const errorMessage =
          e instanceof Error ? e.message : "Unknown error occurred";
        ctx.logger.warn.log(
          "scrapeWebPage: live scrape of %s failed (%s), trying fallbacks",
          url,
          errorMessage,
        );
        return pipe(
          fp.TE.fromTask<string | null, string>(() =>
            scrapeFallback(url, maxLength),
          ),
          fp.TE.chain((fallback) =>
            fallback
              ? fp.TE.right(fallback)
              : fp.TE.left<string, string>(
                  `Error scraping ${url}: ${errorMessage}`,
                ),
          ),
        );
      }),
      fp.TE.fold(
        (error) => () => {
          consecutiveFailuresByUrl.set(url, priorFailures + 1);
          return Promise.resolve(error);
        },
        (result) => () => {
          consecutiveFailuresByUrl.delete(url);
          return Promise.resolve(result);
        },
      ),
    );

    return task();
  };

  const scrapeTool = tool<any, any, any, any>(scrapeFunction, {
    name: "scrapeWebPage",
    description:
      "Navigate to an EXTERNAL URL and extract page content for LLM analysis. " +
      "Use ONLY for external web pages. NEVER use this for lies.exposed platform data (actors, groups, events, links, media, areas, nations) — use the `liexp_cli` tool instead.",
    schema: scrapeWebPageInput,
  });

  return scrapeTool;
};
