import { fp } from "@liexp/core/lib/fp/index.js";
import { type AxiosInstance } from "axios";
import * as TE from "fp-ts/lib/TaskEither.js";
import { pipe } from "fp-ts/lib/function.js";
import { type Metadata, metadataRuleSets } from "page-metadata-parser";

metadataRuleSets.date = {
  rules: [
    [
      'meta[name="article:published_time"]',
      (element: Element) => element.getAttribute("content"),
    ],
    ["time", (el: Element) => el.getAttribute("datetime")],
  ],
};

/**
 * Regex patterns to extract a publish date from raw HTML.
 * Ordered from most-specific (published) to least-specific (modified fallback).
 */
const HTML_DATE_PATTERNS: RegExp[] = [
  // Open Graph / standard: property="article:published_time"
  /<meta[^>]+property=["']article:published_time["'][^>]+content=["']([^"']+)["']/i,
  /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']article:published_time["']/i,
  // name="article:published_time" (non-OG variant)
  /<meta[^>]+name=["']article:published_time["'][^>]+content=["']([^"']+)["']/i,
  /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']article:published_time["']/i,
  // itemprop="datePublished"
  /<meta[^>]+itemprop=["']datePublished["'][^>]+content=["']([^"']+)["']/i,
  /<meta[^>]+content=["']([^"']+)["'][^>]+itemprop=["']datePublished["']/i,
  /<time[^>]+itemprop=["']datePublished["'][^>]+datetime=["']([^"']+)["']/i,
  /<time[^>]+datetime=["']([^"']+)["'][^>]+itemprop=["']datePublished["']/i,
  // meta name="date" / name="pubdate"
  /<meta[^>]+name=["']date["'][^>]+content=["']([^"']+)["']/i,
  /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']date["']/i,
  /<meta[^>]+name=["']pubdate["'][^>]+content=["']([^"']+)["']/i,
  /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']pubdate["']/i,
  // Dublin Core
  /<meta[^>]+name=["']DC\.date\.issued["'][^>]+content=["']([^"']+)["']/i,
  /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']DC\.date\.issued["']/i,
  // JSON-LD: "datePublished":"..."
  /"datePublished"\s*:\s*"([^"]+)"/i,
  // Fallback: modified time (better than nothing)
  /<meta[^>]+property=["']article:modified_time["'][^>]+content=["']([^"']+)["']/i,
  /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']article:modified_time["']/i,
];

/**
 * Extract a publish date from raw HTML by scanning common meta tags and JSON-LD.
 * Returns an ISO date string or null.
 */
export function extractDateFromHTML(html: string): string | null {
  for (const re of HTML_DATE_PATTERNS) {
    const m = re.exec(html);
    if (m?.[1]) {
      const d = new Date(m[1]);
      if (!isNaN(d.getTime())) return d.toISOString();
    }
  }
  return null;
}

export interface URLMetadataClient {
  fetchMetadata: <E>(
    url: string,
    opts: any,
    toError: (e: unknown) => E,
  ) => TE.TaskEither<E, Metadata>;
  fetchHTML: <E>(
    url: string,
    opts: any,
    toError: (e: unknown) => E,
  ) => TE.TaskEither<E, string>;
}

export interface MakeURLMetadataContext {
  client: AxiosInstance;
  parser: {
    getMetadata: (dom: Document, url: string, opts?: any) => Metadata;
  };
}

export const MakeURLMetadata = (
  ctx: MakeURLMetadataContext,
): URLMetadataClient => {
  const fetchHTML = <E>(
    url: string,
    opts: any,
    toError: (e: unknown) => E,
  ): TE.TaskEither<E, string> => {
    return pipe(
      TE.tryCatch(
        () =>
          ctx.client.get<any, { data: string }>(url, { responseType: "text" }),
        toError,
      ),
      TE.map((data) => data.data),
    );
  };

  const fetchMetadata = <E>(
    url: string,
    opts: any,
    toError: (e: unknown) => E,
  ): TE.TaskEither<E, Metadata> => {
    return pipe(
      fetchHTML(url, opts, toError),
      TE.chain((html) =>
        pipe(
          fp.TE.tryCatch(async () => {
            const { parseHTML } = await import("linkedom");
            return parseHTML(html).document;
          }, toError),
          TE.map((dom) => {
            const meta = ctx.parser.getMetadata(dom, url, metadataRuleSets);
            // page-metadata-parser only covers name="article:published_time"
            // and the first <time datetime>. Fall back to the broader regex scan
            // when the parser found nothing.
            meta.date ??= extractDateFromHTML(html) ?? undefined;
            return meta;
          }),
        ),
      ),
    );
  };

  return { fetchHTML, fetchMetadata };
};
