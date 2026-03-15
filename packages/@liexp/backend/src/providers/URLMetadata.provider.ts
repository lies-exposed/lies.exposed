import { fp } from "@liexp/core/lib/fp/index.js";
import { type Logger } from "@liexp/core/lib/logger/Logger.js";
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

// ---------------------------------------------------------------------------
// 1. URL-based date extraction (zero network cost)
// ---------------------------------------------------------------------------

const URL_DATE_PATTERNS: {
  re: RegExp;
  groups: { year: number; month?: number; day?: number };
}[] = [
  // /YYYY/MM/DD/ or /YYYY/MM/DD at end
  {
    re: /\/(\d{4})\/(\d{2})\/(\d{2})(?:\/|$)/,
    groups: { year: 1, month: 2, day: 3 },
  },
  // /YYYY/MM/ (year + month only — only when NOT followed by a day segment)
  { re: /\/(\d{4})\/(\d{2})\/(?!\d)/, groups: { year: 1, month: 2 } },
  // ?date=YYYY-MM-DD or &date=YYYY-MM-DD
  {
    re: /[?&]date=(\d{4})-(\d{2})-(\d{2})/,
    groups: { year: 1, month: 2, day: 3 },
  },
  // -YYYY-MM-DD or _YYYY-MM-DD in path/query (lookahead so trailing separator is not consumed)
  {
    re: /[_-](\d{4})-(\d{2})-(\d{2})(?=[_\-./]|$)/,
    groups: { year: 1, month: 2, day: 3 },
  },
  // Compact: /YYYYMMDD/ (8 consecutive digits between slashes)
  { re: /\/(\d{4})(\d{2})(\d{2})\//, groups: { year: 1, month: 2, day: 3 } },
];

/**
 * Attempt to extract a publication date directly from the URL path or query string.
 * Many news sites embed the date in paths like /2021/03/15/article-slug.
 * Returns an ISO date string or null. Never throws.
 */
export function extractDateFromURL(url: string): string | null {
  const currentYear = new Date().getFullYear();
  for (const { re, groups } of URL_DATE_PATTERNS) {
    const m = re.exec(url);
    if (!m) continue;
    const year = parseInt(m[groups.year], 10);
    const month =
      groups.month !== undefined ? parseInt(m[groups.month], 10) : 1;
    const day = groups.day !== undefined ? parseInt(m[groups.day], 10) : 1;
    if (year < 1990 || year > currentYear + 1) continue;
    if (month < 1 || month > 12) continue;
    if (day < 1 || day > 31) continue;
    const d = new Date(
      `${String(year)}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}T00:00:00Z`,
    );
    if (!isNaN(d.getTime())) return d.toISOString();
  }
  return null;
}

// ---------------------------------------------------------------------------
// 2. JSON-LD full-block parsing (covers @graph and nested structures)
// ---------------------------------------------------------------------------

function walkJSONLDForDate(obj: unknown): string | null {
  if (!obj || typeof obj !== "object") return null;
  if (Array.isArray(obj)) {
    for (const item of obj) {
      const found = walkJSONLDForDate(item);
      if (found) return found;
    }
    return null;
  }
  const record = obj as Record<string, unknown>;
  for (const key of ["datePublished", "dateCreated"]) {
    if (typeof record[key] === "string") {
      const d = new Date(record[key]);
      if (!isNaN(d.getTime())) return d.toISOString();
    }
  }
  for (const val of Object.values(record)) {
    const found = walkJSONLDForDate(val);
    if (found) return found;
  }
  return null;
}

/**
 * Parse all <script type="application/ld+json"> blocks and walk the JSON tree
 * for datePublished / dateCreated, including nested @graph arrays.
 * Returns an ISO date string or null.
 */
export function extractDateFromJSONLD(html: string): string | null {
  const scriptRe =
    /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m: RegExpExecArray | null;
  while ((m = scriptRe.exec(html)) !== null) {
    try {
      const date = walkJSONLDForDate(JSON.parse(m[1]));
      if (date) return date;
    } catch {
      // malformed JSON-LD block — skip
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// 3. archive.ph original-URL extraction
// ---------------------------------------------------------------------------

const ARCHIVE_PH_RE = /^https?:\/\/archive\.ph\//i;

/**
 * Extract the original archived URL from an archive.ph page's HTML.
 * archive.ph renders the original URL in a text input with id="url".
 * Returns the original URL string or null.
 */
export function extractOriginalURLFromArchivePh(html: string): string | null {
  // Attribute order: id before value
  let m = /<input[^>]+id=["']url["'][^>]+value=["']([^"']+)["']/i.exec(html);
  // Attribute order: value before id
  m ??= /<input[^>]+value=["']([^"']+)["'][^>]+id=["']url["']/i.exec(html);
  const candidate = m?.[1];
  if (candidate && /^https?:\/\//i.test(candidate)) return candidate;
  return null;
}

// ---------------------------------------------------------------------------
// 4. HTML meta-tag regex patterns (OG, itemprop, Dublin Core, modified fallback)
//    Note: JSON-LD is intentionally excluded here — handled by extractDateFromJSONLD.
// ---------------------------------------------------------------------------

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
  // Google Scholar / Highwire citation meta tags (Elsevier, Springer, Wiley, MDPI, PLoS, etc.)
  // Format is typically YYYY/MM/DD
  /<meta[^>]+name=["']citation_publication_date["'][^>]+content=["']([^"']+)["']/i,
  /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']citation_publication_date["']/i,
  /<meta[^>]+name=["']citation_online_date["'][^>]+content=["']([^"']+)["']/i,
  /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']citation_online_date["']/i,
  /<meta[^>]+name=["']citation_date["'][^>]+content=["']([^"']+)["']/i,
  /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']citation_date["']/i,
  // Fallback: modified time (better than nothing)
  /<meta[^>]+property=["']article:modified_time["'][^>]+content=["']([^"']+)["']/i,
  /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']article:modified_time["']/i,
];

/**
 * Extract a publish date from raw HTML by scanning common meta tags.
 * JSON-LD is handled separately by extractDateFromJSONLD.
 * Returns an ISO date string or null.
 */
export function extractDateFromHTML(html: string): string | null {
  for (const re of HTML_DATE_PATTERNS) {
    const m = re.exec(html);
    if (m?.[1]) {
      // Normalize YYYY/MM/DD (used by citation_* meta tags) to YYYY-MM-DD so
      // that new Date() parses it as UTC rather than local time.
      const normalized = m[1].replace(
        /^(\d{4})\/(\d{2})\/(\d{2})$/,
        "$1-$2-$3",
      );
      const d = new Date(normalized);
      if (!isNaN(d.getTime())) return d.toISOString();
    }
  }
  return null;
}

/**
 * Extract the "Date of Patent" from freepatentsonline.com HTML pages.
 * Format: "Date of Patent: Jul. 2, 2002" or "Date of Patent: October 15, 1996".
 * Returns an ISO date string or null.
 */
export function extractDateFromPatentHTML(html: string): string | null {
  // Justia renders: <strong>Date of Patent</strong>: Jul 2, 2002
  // Allow up to 30 chars (e.g. a closing tag) between "Date of Patent" and ":".
  const m =
    /Date of Patent[\s\S]{0,30}?:\s*([A-Za-z]+\.?\s+\d{1,2},\s*\d{4})/i.exec(
      html,
    );
  if (!m) return null;
  // Strip trailing periods from month abbreviations ("Jul." → "Jul")
  const d = new Date(m[1].replace(/\.(\s)/, "$1"));
  if (isNaN(d.getTime())) return null;
  return new Date(
    Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()),
  ).toISOString();
}

// ---------------------------------------------------------------------------
// 5. Domain-specific API fetchers (NCBI, CrossRef, Archive.org)
// ---------------------------------------------------------------------------

// 5a. NCBI / PubMed E-utils
const NCBI_PUBMED_RE =
  /^https?:\/\/(?:www\.)?(?:pubmed\.ncbi\.nlm\.nih\.gov|ncbi\.nlm\.nih\.gov\/pubmed)\/(\d+)/i;
const NCBI_PMC_RE =
  /^https?:\/\/(?:www\.)?ncbi\.nlm\.nih\.gov\/(?:labs\/)?pmc\/articles\/PMC(\d+)/i;

function parseNCBIPubDate(pubdate: string): string | null {
  if (!pubdate) return null;
  // Formats: "2021 Mar 15", "2021 Mar", "2021"
  const parts = pubdate.trim().split(/\s+/);
  const year = parseInt(parts[0], 10);
  if (isNaN(year) || year < 1900) return null;
  if (parts[1]) {
    const day = parts[2] ? parseInt(parts[2], 10) : 1;
    const d = new Date(`${parts[1]} ${day}, ${year}`);
    if (!isNaN(d.getTime()))
      return new Date(
        Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()),
      ).toISOString();
  }
  return new Date(`${year}-01-01T00:00:00Z`).toISOString();
}

async function fetchNCBIDate(
  client: AxiosInstance,
  url: string,
): Promise<string | null> {
  const pmidMatch = NCBI_PUBMED_RE.exec(url);
  const pmcMatch = NCBI_PMC_RE.exec(url);
  if (!pmidMatch && !pmcMatch) return null;

  const db = pmcMatch ? "pmc" : "pubmed";
  const id = (pmcMatch ?? pmidMatch)![1];

  try {
    const { data } = await client.get(
      "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi",
      { timeout: 10_000, params: { db, id, retmode: "json" } },
    );
    const result = data?.result?.[id];
    if (!result) return null;
    return parseNCBIPubDate(result.epubdate ?? result.pubdate);
  } catch {
    return null;
  }
}

// 5b. CrossRef (doi.org / dx.doi.org)
const DOI_URL_RE = /^https?:\/\/(?:dx\.)?doi\.org\/(.+)/i;

function parseCrossRefDateParts(dateParts: unknown): string | null {
  if (!Array.isArray(dateParts) || !Array.isArray(dateParts[0])) return null;
  const [year, month = 1, day = 1] = dateParts[0] as number[];
  if (!year || year < 1900) return null;
  const d = new Date(
    `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}T00:00:00Z`,
  );
  return isNaN(d.getTime()) ? null : d.toISOString();
}

async function fetchCrossRefDate(
  client: AxiosInstance,
  url: string,
): Promise<string | null> {
  const m = DOI_URL_RE.exec(url);
  if (!m) return null;
  try {
    const { data } = await client.get(
      `https://api.crossref.org/works/${m[1]}`,
      {
        timeout: 10_000,
        headers: {
          "User-Agent": "lies-exposed/0.3.0 (mailto:info@lies.exposed)",
        },
      },
    );
    const msg = data?.message;
    if (!msg) return null;
    return (
      parseCrossRefDateParts(msg["published-print"]?.["date-parts"]) ??
      parseCrossRefDateParts(msg["published-online"]?.["date-parts"]) ??
      parseCrossRefDateParts(msg.created?.["date-parts"])
    );
  } catch {
    return null;
  }
}

// 5c. Internet Archive metadata API
const ARCHIVE_ORG_RE = /^https?:\/\/archive\.org\/details\/([^/?#]+)/i;

async function fetchArchiveOrgDate(
  client: AxiosInstance,
  url: string,
): Promise<string | null> {
  const m = ARCHIVE_ORG_RE.exec(url);
  if (!m) return null;
  try {
    const { data } = await client.get(`https://archive.org/metadata/${m[1]}`, {
      timeout: 10_000,
    });
    const dateStr: string | undefined =
      data?.metadata?.date ?? data?.metadata?.year;
    if (!dateStr) return null;
    const iso = dateStr.length === 4 ? `${dateStr}-01-01T00:00:00Z` : dateStr;
    const d = new Date(iso);
    return isNaN(d.getTime()) ? null : d.toISOString();
  } catch {
    return null;
  }
}

/**
 * Run all domain-specific API fetchers in parallel and return the first date found.
 * Returns null when no API matches the URL or all calls fail.
 */
async function fetchDomainSpecificDate(
  client: AxiosInstance,
  url: string,
): Promise<string | null> {
  const results = await Promise.all([
    fetchNCBIDate(client, url),
    fetchCrossRefDate(client, url),
    fetchArchiveOrgDate(client, url),
  ]);
  return results.find((r) => r !== null) ?? null;
}

// ---------------------------------------------------------------------------
// 5d. freepatentsonline.com — redirect to Justia Patents (accessible, same data)
// freepatentsonline.com blocks automated HTTP requests (ERR_CONNECTION_RESET).
// Justia Patents is openly accessible and includes "Date of Patent" in raw HTML.
// ---------------------------------------------------------------------------

// US numeric patent:   /6412416.pdf  → patents.justia.com/patent/6412416
// US publication:      /y2012/0115240.html → patents.justia.com/patent/20120115240
// EP/WO/other:         /EP2435633A1.pdf → patents.justia.com/patent/EP2435633A1
const FREEPATENTS_BASE = /^https?:\/\/(?:www\.)?freepatentsonline\.com\//i;
const FREEPATENTS_Y_RE =
  /^https?:\/\/(?:www\.)?freepatentsonline\.com\/y(\d{4})\/0*(\d+)(?:\.html)?$/i;
const FREEPATENTS_OTHER_RE =
  /^https?:\/\/(?:www\.)?freepatentsonline\.com\/(.+?)(?:\.pdf|\.html)?$/i;

/**
 * Redirect any freepatentsonline.com URL to the equivalent Justia Patents page.
 * For all other URLs returns the original URL unchanged.
 */
function normalizeFetchURL(url: string): string {
  if (!FREEPATENTS_BASE.test(url)) return url;

  // y-series (US application): y2012/0115240 → 20120115240
  const ym = FREEPATENTS_Y_RE.exec(url);
  if (ym)
    return `https://patents.justia.com/patent/${ym[1]}${ym[2].padStart(7, "0")}`;

  // Everything else: strip extension and pass the id as-is
  const om = FREEPATENTS_OTHER_RE.exec(url);
  if (om) return `https://patents.justia.com/patent/${om[1]}`;

  return url;
}

// ---------------------------------------------------------------------------
// 4. Wayback Machine CDX API (last resort — for inaccessible / undated pages)
// ---------------------------------------------------------------------------

const WAYBACK_CDX_BASE = "https://web.archive.org/cdx/search/cdx";

function parseWaybackTimestamp(ts: string): string | null {
  if (ts.length !== 14) return null;
  const d = new Date(
    `${ts.slice(0, 4)}-${ts.slice(4, 6)}-${ts.slice(6, 8)}T${ts.slice(8, 10)}:${ts.slice(10, 12)}:${ts.slice(12, 14)}Z`,
  );
  return isNaN(d.getTime()) ? null : d.toISOString();
}

/**
 * Query the Wayback Machine CDX API for the earliest successful crawl of a URL.
 * Returns an ISO date string or null. Never propagates errors.
 */
async function fetchWaybackDate(
  client: AxiosInstance,
  url: string,
): Promise<string | null> {
  try {
    const { data } = await client.get<string[][]>(WAYBACK_CDX_BASE, {
      timeout: 10_000,
      params: {
        url,
        output: "json",
        limit: 1,
        fl: "timestamp",
        filter: "statuscode:200",
        matchType: "exact",
        collapse: "urlkey",
      },
    });
    // Response format: [["timestamp"], ["20210315123456"]] — first row is the header
    const row = data[1];
    if (!Array.isArray(row) || typeof row[0] !== "string") return null;
    return parseWaybackTimestamp(row[0]);
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Provider interfaces & factory
// ---------------------------------------------------------------------------

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
  logger?: Logger;
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
          ctx.client.get<any, { data: string }>(url, {
            responseType: "text",
            timeout: opts?.timeout,
          }),
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
    // extractDateFromURL is free (no network) — compute once upfront so it is
    // available regardless of whether the HTML fetch succeeds or fails.
    const urlDate = extractDateFromURL(url);

    // For freepatentsonline.com PDF URLs, fetch the HTML equivalent so that
    // "Date of Patent" can be extracted from the page markup.
    const fetchUrl = normalizeFetchURL(url);

    // Inner step: fetch HTML and extract all DOM/HTML-based signals.
    // On any failure (bot block, 404, JS wall, parse error) we fall back to
    // empty metadata so the outer steps (URL date, domain APIs, Wayback) can
    // still run.
    const fromHTML: TE.TaskEither<E, Metadata> = pipe(
      fetchHTML(fetchUrl, opts, toError),
      TE.chain((html) =>
        pipe(
          fp.TE.tryCatch(async () => {
            const { parseHTML } = await import("linkedom");
            return parseHTML(html).document;
          }, toError),
          TE.map((dom) => {
            const meta = ctx.parser.getMetadata(dom, url, metadataRuleSets);
            // 1. JSON-LD full block parsing (covers @graph and nested structures)
            meta.date ??= extractDateFromJSONLD(html) ?? undefined;
            // 2. HTML meta / itemprop / Dublin Core regex patterns
            meta.date ??= extractDateFromHTML(html) ?? undefined;
            // 3. Patent HTML: "Date of Patent: Month DD, YYYY"
            meta.date ??= extractDateFromPatentHTML(html) ?? undefined;
            // 4. For archive.ph pages: extract the original URL and derive the
            //    date from its path (e.g. reuters.com/2021/03/15/article-slug).
            //    The archived HTML already contains the original meta tags above;
            //    this step recovers dates that were only in the original URL path.
            if (ARCHIVE_PH_RE.test(url)) {
              const originalUrl = extractOriginalURLFromArchivePh(html);
              if (originalUrl) {
                meta.date ??= extractDateFromURL(originalUrl) ?? undefined;
              }
            }
            return meta;
          }),
        ),
      ),
      TE.orElse((_err) => {
        ctx.logger?.info.log(
          "[URLMetadata] HTML fetch/parse failed for %s — falling back to URL pattern and domain APIs",
          url,
        );
        return TE.right<E, Metadata>({ url } as Partial<Metadata> as Metadata);
      }),
    );

    return pipe(
      fromHTML,
      // 5. URL path / query string (free — applies even when HTML fetch failed)
      TE.map((meta) => {
        meta.date ??= urlDate ?? undefined;
        return meta;
      }),
      // 6. Domain-specific APIs: NCBI, CrossRef, Archive.org (run in parallel)
      TE.chain((meta) => {
        if (meta.date !== undefined) return TE.right(meta);
        ctx.logger?.info.log(
          "[URLMetadata] No date found via HTML/URL for %s — trying domain-specific APIs",
          url,
        );
        return pipe(
          TE.fromTask(() => fetchDomainSpecificDate(ctx.client, url)),
          TE.map((date) => {
            if (date) {
              ctx.logger?.info.log(
                "[URLMetadata] Domain API resolved date for %s → %s",
                url,
                date,
              );
            }
            return { ...meta, date: date ?? undefined };
          }),
        );
      }),
      // 7. Wayback Machine CDX API (last resort)
      TE.chain((meta) => {
        if (meta.date !== undefined) return TE.right(meta);
        ctx.logger?.info.log(
          "[URLMetadata] No date found via domain APIs for %s — querying Wayback Machine CDX",
          url,
        );
        return pipe(
          TE.fromTask(() => fetchWaybackDate(ctx.client, url)),
          TE.map((date) => {
            if (date) {
              ctx.logger?.info.log(
                "[URLMetadata] Wayback Machine CDX resolved date for %s → %s",
                url,
                date,
              );
            } else {
              ctx.logger?.info.log(
                "[URLMetadata] Wayback Machine CDX found no date for %s",
                url,
              );
            }
            return { ...meta, date: date ?? undefined };
          }),
        );
      }),
    );
  };

  return { fetchHTML, fetchMetadata };
};
