import { tool } from "@langchain/core/tools";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { effectToZod } from "@liexp/shared/lib/utils/schema.utils.js";
import { Schema } from "effect/index";
import { type PuppeteerProviderContext } from "../../../context/puppeteer.context.js";
import { toPuppeteerError } from "../../puppeteer.provider.js";

/**
 * Enhanced content extraction optimized for LLM consumption
 */
const extractStructuredContentFromHTML = (
  html: string,
): {
  title: string;
  headings: Array<{ level: number; text: string }>;
  content: string;
  links: Array<{ text: string; href: string }>;
  listItems: string[];
} => {
  // Remove script and style elements completely
  let cleanedHtml = html.replace(
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    "",
  );
  cleanedHtml = cleanedHtml.replace(
    /<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi,
    "",
  );

  // Extract title
  const titleMatch = /<title[^>]*>([^<]+)<\/title>/i.exec(cleanedHtml);
  const title = titleMatch ? titleMatch[1].trim() : "";

  // Extract headings with hierarchy
  const headings: Array<{ level: number; text: string }> = [];
  const headingRegex = /<h([1-6])[^>]*>([^<]+)<\/h[1-6]>/gi;
  let headingMatch;
  while ((headingMatch = headingRegex.exec(cleanedHtml)) !== null) {
    headings.push({
      level: parseInt(headingMatch[1], 10),
      text: decodeHtmlEntities(headingMatch[2].trim()),
    });
  }

  // Extract links
  const links: Array<{ text: string; href: string }> = [];
  const linkRegex = /<a[^>]+href=["']([^"']+)["'][^>]*>([^<]+)<\/a>/gi;
  let linkMatch;
  while ((linkMatch = linkRegex.exec(cleanedHtml)) !== null) {
    links.push({
      href: linkMatch[1],
      text: decodeHtmlEntities(linkMatch[2].trim()),
    });
  }

  // Extract list items
  const listItems: string[] = [];
  const listItemRegex =
    /<li[^>]*>([^<]+(?:<[^>]+>[^<]*<\/[^>]+>[^<]*)*)<\/li>/gi;
  let listMatch;
  while ((listMatch = listItemRegex.exec(cleanedHtml)) !== null) {
    const itemText = listMatch[1].replace(/<[^>]+>/g, " ").trim();
    if (itemText) {
      listItems.push(decodeHtmlEntities(itemText));
    }
  }

  // Convert to structured text preserving hierarchy
  let structuredContent = cleanedHtml;

  // Replace headings with markdown-style formatting
  structuredContent = structuredContent.replace(
    /<h([1-6])[^>]*>([^<]+)<\/h[1-6]>/gi,
    (_, level, text) => {
      const hashes = "#".repeat(parseInt(level, 10));
      return `\n\n${hashes} ${text.trim()}\n\n`;
    },
  );

  // Replace paragraphs with proper spacing
  structuredContent = structuredContent.replace(
    /<p[^>]*>([^<]+(?:<[^>]+>[^<]*<\/[^>]+>[^<]*)*)<\/p>/gi,
    "\n\n$1\n\n",
  );

  // Replace line breaks
  structuredContent = structuredContent.replace(/<br\s*\/?>/gi, "\n");

  // Replace divs with spacing
  structuredContent = structuredContent.replace(/<div[^>]*>/gi, "\n");
  structuredContent = structuredContent.replace(/<\/div>/gi, "\n");

  // Remove remaining HTML tags
  structuredContent = structuredContent.replace(/<[^>]+>/g, " ");

  // Decode HTML entities
  structuredContent = decodeHtmlEntities(structuredContent);

  // Clean up whitespace while preserving structure
  structuredContent = structuredContent
    .replace(/\n\s*\n\s*\n/g, "\n\n") // Reduce multiple newlines to double
    .replace(/[ \t]+/g, " ") // Normalize spaces and tabs
    .trim();

  return {
    title,
    headings,
    content: structuredContent,
    links,
    listItems,
  };
};

/**
 * Decode HTML entities
 */
const decodeHtmlEntities = (text: string): string => {
  return text
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, num) => String.fromCharCode(parseInt(num, 10)))
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) =>
      String.fromCharCode(parseInt(hex, 16)),
    );
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
  const basic: Record<string, string> = {};
  const openGraph: Record<string, string> = {};
  const twitterCard: Record<string, string> = {};
  const jsonLd: any[] = [];

  // Extract title
  const titleMatch = /<title[^>]*>([^<]+)<\/title>/i.exec(html);
  if (titleMatch) {
    basic.title = decodeHtmlEntities(titleMatch[1].trim());
  }

  // Extract language
  const langMatch = /<html[^>]+lang=["']([^"']+)["']/i.exec(html);
  const lang = langMatch ? langMatch[1] : "en";

  // Extract canonical URL
  const canonicalMatch =
    /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i.exec(html);
  const canonicalUrl = canonicalMatch ? canonicalMatch[1] : undefined;

  // Extract meta tags
  const metaRegex = /<meta\s+([^>]+)>/gi;
  let metaMatch;

  while ((metaMatch = metaRegex.exec(html)) !== null) {
    const metaAttributes = metaMatch[1];

    // Extract name/property and content
    const nameMatch = /(?:name|property)=["']([^"']+)["']/i.exec(
      metaAttributes,
    );
    const contentMatch = /content=["']([^"']+)["']/i.exec(metaAttributes);

    if (nameMatch && contentMatch) {
      const name = nameMatch[1].toLowerCase();
      const content = decodeHtmlEntities(contentMatch[1]);

      if (name.startsWith("og:")) {
        openGraph[name] = content;
      } else if (name.startsWith("twitter:")) {
        twitterCard[name] = content;
      } else {
        basic[name] = content;
      }
    }
  }

  // Extract JSON-LD structured data
  const jsonLdRegex =
    /<script[^>]+type=["']application\/ld\+json["'][^>]*>([^<]+)<\/script>/gi;
  let jsonLdMatch;

  while ((jsonLdMatch = jsonLdRegex.exec(html)) !== null) {
    try {
      const jsonData = JSON.parse(jsonLdMatch[1]);
      jsonLd.push(jsonData);
    } catch (e) {
      // Skip invalid JSON-LD
    }
  }

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
      metadata.jsonLd.forEach((data, index) => {
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
    description: "Wait for network idle before extracting content",
  }),
});

type ScrapeWebPageInputSchema = typeof ScrapeWebpageInputSchema.Type;

const scrapeWebPageInput = effectToZod(ScrapeWebpageInputSchema);

/**
 * Creates a web scraping tool optimized for LLM consumption
 */
export const createWebScrapingTool = (ctx: PuppeteerProviderContext) => {
  const scrapeFunction = async (
    input: ScrapeWebPageInputSchema,
  ): Promise<string> => {
    const {
      url,
      includeMetadata = true,
      maxLength = 15000,
      waitForNetworkIdle = true,
    } = input;

    if (!url) {
      throw new Error("URL is required");
    }

    const task = pipe(
      ctx.puppeteer.execute(
        { defaultViewport: { width: 1280, height: 800 } },
        (browser) => {
          return pipe(
            fp.TE.tryCatch(async () => {
              const page = await browser.newPage();

              // Navigate to the page
              const waitUntilOption = waitForNetworkIdle
                ? "networkidle0"
                : "domcontentloaded";
              await page.goto(url, {
                waitUntil: waitUntilOption,
                timeout: 30000,
              });

              // Wait a bit more for dynamic content
              if (waitForNetworkIdle) {
                await page
                  .waitForSelector("body", { timeout: 2000 })
                  .catch(() => {
                    // Ignore timeout, continue anyway
                  });
              }

              // Get the full HTML content
              const html = await page.content();

              return html;
            }, toPuppeteerError),
            fp.TE.map((html) => {
              // Extract structured content and metadata
              const structuredContent = extractStructuredContentFromHTML(html);
              const metadata = extractComprehensiveMetadata(html);

              // Format for LLM consumption
              return formatForLLM(
                url,
                structuredContent,
                metadata,
                includeMetadata,
                maxLength,
              );
            }),
          );
        },
      ),
      fp.TE.mapLeft((e) => {
        const errorMessage =
          e instanceof Error ? e.message : "Unknown error occurred";
        return `Error scraping ${url}: ${errorMessage}`;
      }),
      fp.TE.fold(
        (error) => () => Promise.resolve(error),
        (result) => () => Promise.resolve(result),
      ),
    );

    return task();
  };

  const scrapeTool = tool<any, any, any, any>(scrapeFunction, {
    name: "scrapeWebPage",
    description:
      "Navigate to a URL and extract comprehensive page content optimized for LLM analysis. Extracts structured content, metadata, headings, links, and key information while preserving semantic structure.",
    schema: scrapeWebPageInput,
  });

  return scrapeTool;
};
