import { URL } from "@liexp/io/lib/http/Common/URL.js";
import { Schema } from "effect/index";
import * as R from "fp-ts/lib/Record.js";
import { pipe } from "fp-ts/lib/function.js";
import qs from "query-string";

// ─── extractDateFromUrl ───────────────────────────────────────────────────────
// Pure utility: extracts a publish date from a URL path using common patterns.
// Shared between the admin UI (URLMetadataInput) and backend/worker.

const MONTH_ABBR: Record<string, string> = {
  jan: "01",
  feb: "02",
  mar: "03",
  apr: "04",
  may: "05",
  jun: "06",
  jul: "07",
  aug: "08",
  sep: "09",
  oct: "10",
  nov: "11",
  dec: "12",
};

// /YYYY/MM/DD or /YYYY/mon/DD (trailing slash optional)
const URL_DATE_YMD =
  /\/(\d{4})\/(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|0?\d|1[0-2])\/(\d{1,2})(?:\/|$|[^-\d])/i;
// /YYYY_MM_DD/
const URL_DATE_UNDERSCORE = /[/_](\d{4})_(\d{2})_(\d{2})(?:[/_]|$)/;
// Wayback Machine: /web/YYYYMMDDHHMMSS/
const URL_DATE_WAYBACK = /\/web\/(\d{4})(\d{2})(\d{2})\d{6}\//;
// Compact: /YYYYMMDD[non-digit]
const URL_DATE_COMPACT = /[/_-](\d{4})(\d{2})(\d{2})(?:[^0-9]|$)/;

function _parseUrlDateParts(
  year: string,
  month: string,
  day: string,
): Date | null {
  const mm = MONTH_ABBR[month.toLowerCase()] ?? month.padStart(2, "0");
  const dd = day.padStart(2, "0");
  const d = new Date(`${year}-${mm}-${dd}T00:00:00.000Z`);
  return isNaN(d.getTime()) ? null : d;
}

function _extractDateFromUrlString(url: string): Date | null {
  let m: RegExpExecArray | null;

  m = URL_DATE_YMD.exec(url);
  if (m) return _parseUrlDateParts(m[1], m[2], m[3]);

  m = URL_DATE_UNDERSCORE.exec(url);
  if (m) return _parseUrlDateParts(m[1], m[2], m[3]);

  m = URL_DATE_WAYBACK.exec(url);
  if (m) return _parseUrlDateParts(m[1], m[2], m[3]);

  m = URL_DATE_COMPACT.exec(url);
  if (m) {
    const year = parseInt(m[1], 10);
    const month = parseInt(m[2], 10);
    const day = parseInt(m[3], 10);
    // Sanity-check: compact format shares the pattern with many non-date numbers,
    // so validate the calendar range before accepting the match.
    if (
      year >= 1900 &&
      year <= 2099 &&
      month >= 1 &&
      month <= 12 &&
      day >= 1 &&
      day <= 31
    ) {
      return _parseUrlDateParts(m[1], m[2], m[3]);
    }
  }

  return null;
}

/**
 * Extract a publish date from a URL path using common date patterns.
 * For Wayback Machine URLs the original URL's date is preferred over
 * the capture timestamp.
 * Returns a Date set to midnight UTC, or null if no date is found.
 */
export function extractDateFromUrl(url: string): Date | null {
  const waybackOriginal = /archive\.org\/web\/\d{14}\/(https?:\/\/.+)/i.exec(
    url,
  );
  if (waybackOriginal) {
    return (
      _extractDateFromUrlString(waybackOriginal[1]) ??
      _extractDateFromUrlString(url)
    );
  }
  return _extractDateFromUrlString(url);
}

export const sanitizeURL = (url: URL): URL => {
  const [cleanURL, query] = url.split("?");
  const cleanQuery = pipe(
    qs.parse(query),
    R.filterWithIndex(
      (index) =>
        !["utm_", "fbclid"].some((c) => index.toLowerCase().startsWith(c)),
    ),
  );

  if (!R.isEmpty(cleanQuery)) {
    return Schema.decodeSync(URL)(`${cleanURL}?${qs.stringify(cleanQuery)}`);
  }

  return Schema.decodeSync(URL)(cleanURL);
};

const encodeWithSpaceEndpoint = (url: string): string => {
  if (url.startsWith("https://") || url.startsWith("http://")) {
    return url;
  }

  if (url.startsWith("//")) {
    return `https:${url}`;
  }

  return `https://${url}`;
};

export const ensureHTTPProtocol = (url: string): URL => {
  return pipe(encodeWithSpaceEndpoint(url), Schema.decodeSync(URL));
};
