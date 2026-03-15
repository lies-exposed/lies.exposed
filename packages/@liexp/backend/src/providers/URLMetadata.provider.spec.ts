import { describe, expect, it } from "vitest";
import {
  extractDateFromHTML,
  extractDateFromJSONLD,
  extractDateFromNextData,
  extractDateFromPatentHTML,
  extractDateFromURL,
  extractOriginalURLFromArchivePh,
  extractPublishedOnlineDate,
} from "./URLMetadata.provider.js";

// ---------------------------------------------------------------------------
// extractDateFromHTML
// ---------------------------------------------------------------------------

describe("extractDateFromHTML", () => {
  it("extracts property='article:published_time' (Open Graph)", () => {
    const html = `<meta property="article:published_time" content="2023-07-26T10:00:00Z">`;
    expect(extractDateFromHTML(html)).toBe(
      new Date("2023-07-26T10:00:00Z").toISOString(),
    );
  });

  it("extracts property='article:published_time' with reversed attribute order", () => {
    const html = `<meta content="2023-07-26T10:00:00Z" property="article:published_time">`;
    expect(extractDateFromHTML(html)).toBe(
      new Date("2023-07-26T10:00:00Z").toISOString(),
    );
  });

  it("extracts name='article:published_time'", () => {
    const html = `<meta name="article:published_time" content="2022-03-15T08:30:00Z">`;
    expect(extractDateFromHTML(html)).toBe(
      new Date("2022-03-15T08:30:00Z").toISOString(),
    );
  });

  it("extracts itemprop='datePublished' on meta", () => {
    const html = `<meta itemprop="datePublished" content="2021-11-01T00:00:00Z">`;
    expect(extractDateFromHTML(html)).toBe(
      new Date("2021-11-01T00:00:00Z").toISOString(),
    );
  });

  it("extracts itemprop='datePublished' on time element", () => {
    const html = `<time itemprop="datePublished" datetime="2020-06-10T12:00:00Z">June 10, 2020</time>`;
    expect(extractDateFromHTML(html)).toBe(
      new Date("2020-06-10T12:00:00Z").toISOString(),
    );
  });

  it("extracts name='date'", () => {
    const html = `<meta name="date" content="2019-04-01T00:00:00Z">`;
    expect(extractDateFromHTML(html)).toBe(
      new Date("2019-04-01T00:00:00Z").toISOString(),
    );
  });

  it("extracts name='pubdate'", () => {
    const html = `<meta name="pubdate" content="2018-09-20T00:00:00Z">`;
    expect(extractDateFromHTML(html)).toBe(
      new Date("2018-09-20T00:00:00Z").toISOString(),
    );
  });

  it("extracts DC.date.issued", () => {
    const html = `<meta name="DC.date.issued" content="2017-05-05T00:00:00Z">`;
    expect(extractDateFromHTML(html)).toBe(
      new Date("2017-05-05T00:00:00Z").toISOString(),
    );
  });

  it("does NOT extract JSON-LD (handled by extractDateFromJSONLD)", () => {
    // JSON-LD is intentionally excluded from HTML_DATE_PATTERNS now
    const html = `<script type="application/ld+json">{"datePublished":"2024-02-14T09:00:00Z"}</script>`;
    expect(extractDateFromHTML(html)).toBeNull();
  });

  it("falls back to article:modified_time when no published date present", () => {
    const html = `<meta property="article:modified_time" content="2025-01-01T00:00:00Z">`;
    expect(extractDateFromHTML(html)).toBe(
      new Date("2025-01-01T00:00:00Z").toISOString(),
    );
  });

  it("prefers published_time over modified_time when both present", () => {
    const html = `
      <meta property="article:published_time" content="2023-03-10T00:00:00Z">
      <meta property="article:modified_time" content="2025-01-01T00:00:00Z">
    `;
    expect(extractDateFromHTML(html)).toBe(
      new Date("2023-03-10T00:00:00Z").toISOString(),
    );
  });

  it("extracts dc.date (Dublin Core lowercase, used by MDPI)", () => {
    const html = `<meta name="dc.date" content="2021-10-13">`;
    expect(extractDateFromHTML(html)).toBe("2021-10-13T00:00:00.000Z");
  });

  it("extracts prism.publicationDate (used by MDPI)", () => {
    const html = `<meta name="prism.publicationDate" content="2021-10-13">`;
    expect(extractDateFromHTML(html)).toBe("2021-10-13T00:00:00.000Z");
  });

  it("extracts citation_publication_date (Elsevier/ScienceDirect YYYY/MM/DD)", () => {
    const html = `<meta name="citation_publication_date" content="2022/09/22">`;
    expect(extractDateFromHTML(html)).toBe("2022-09-22T00:00:00.000Z");
  });

  it("extracts citation_online_date", () => {
    const html = `<meta name="citation_online_date" content="2022/08/31">`;
    expect(extractDateFromHTML(html)).toBe("2022-08-31T00:00:00.000Z");
  });

  it("extracts citation_date", () => {
    const html = `<meta name="citation_date" content="2021/03/15">`;
    expect(extractDateFromHTML(html)).toBe("2021-03-15T00:00:00.000Z");
  });

  it("prefers citation_publication_date over citation_online_date", () => {
    const html = `
      <meta name="citation_publication_date" content="2022/09/22">
      <meta name="citation_online_date" content="2022/08/31">
    `;
    expect(extractDateFromHTML(html)).toBe("2022-09-22T00:00:00.000Z");
  });

  it("returns null when no date pattern matches", () => {
    const html = `<html><head><title>No dates here</title></head><body></body></html>`;
    expect(extractDateFromHTML(html)).toBeNull();
  });

  it("returns null for invalid date values", () => {
    const html = `<meta property="article:published_time" content="not-a-date">`;
    expect(extractDateFromHTML(html)).toBeNull();
  });

  it("handles single-quoted attribute values", () => {
    const html = `<meta property='article:published_time' content='2022-08-18T00:00:00Z'>`;
    expect(extractDateFromHTML(html)).toBe(
      new Date("2022-08-18T00:00:00Z").toISOString(),
    );
  });
});

// ---------------------------------------------------------------------------
// extractDateFromJSONLD
// ---------------------------------------------------------------------------

describe("extractDateFromJSONLD", () => {
  it("extracts datePublished from a flat JSON-LD object", () => {
    const html = `<script type="application/ld+json">{"@type":"Article","datePublished":"2024-02-14T09:00:00Z"}</script>`;
    expect(extractDateFromJSONLD(html)).toBe(
      new Date("2024-02-14T09:00:00Z").toISOString(),
    );
  });

  it("extracts datePublished nested inside @graph", () => {
    const html = `<script type="application/ld+json">{"@context":"https://schema.org","@graph":[{"@type":"WebPage"},{"@type":"Article","datePublished":"2021-06-01T00:00:00Z"}]}</script>`;
    expect(extractDateFromJSONLD(html)).toBe(
      new Date("2021-06-01T00:00:00Z").toISOString(),
    );
  });

  it("falls back to dateCreated when datePublished absent", () => {
    const html = `<script type="application/ld+json">{"@type":"Article","dateCreated":"2020-05-10T00:00:00Z"}</script>`;
    expect(extractDateFromJSONLD(html)).toBe(
      new Date("2020-05-10T00:00:00Z").toISOString(),
    );
  });

  it("prefers datePublished over dateCreated", () => {
    const html = `<script type="application/ld+json">{"datePublished":"2023-01-01T00:00:00Z","dateCreated":"2022-01-01T00:00:00Z"}</script>`;
    expect(extractDateFromJSONLD(html)).toBe(
      new Date("2023-01-01T00:00:00Z").toISOString(),
    );
  });

  it("scans multiple ld+json blocks and returns the first date found", () => {
    const html = `
      <script type="application/ld+json">{"@type":"WebSite","name":"Example"}</script>
      <script type="application/ld+json">{"@type":"Article","datePublished":"2022-11-20T00:00:00Z"}</script>
    `;
    expect(extractDateFromJSONLD(html)).toBe(
      new Date("2022-11-20T00:00:00Z").toISOString(),
    );
  });

  it("skips malformed JSON-LD blocks without throwing", () => {
    const html = `
      <script type="application/ld+json">{ INVALID JSON }</script>
      <script type="application/ld+json">{"datePublished":"2019-03-05T00:00:00Z"}</script>
    `;
    expect(extractDateFromJSONLD(html)).toBe(
      new Date("2019-03-05T00:00:00Z").toISOString(),
    );
  });

  it("returns null when no ld+json block is present", () => {
    const html = `<html><head><title>No JSON-LD</title></head></html>`;
    expect(extractDateFromJSONLD(html)).toBeNull();
  });

  it("returns null when ld+json block has no date fields", () => {
    const html = `<script type="application/ld+json">{"@type":"Organization","name":"Acme"}</script>`;
    expect(extractDateFromJSONLD(html)).toBeNull();
  });

  it("returns null for invalid date values inside JSON-LD", () => {
    const html = `<script type="application/ld+json">{"datePublished":"not-a-date"}</script>`;
    expect(extractDateFromJSONLD(html)).toBeNull();
  });

  it("handles deeply nested structures", () => {
    const html = `<script type="application/ld+json">{"@graph":[{"hasPart":{"@type":"Article","datePublished":"2018-08-08T00:00:00Z"}}]}</script>`;
    expect(extractDateFromJSONLD(html)).toBe(
      new Date("2018-08-08T00:00:00Z").toISOString(),
    );
  });
});

// ---------------------------------------------------------------------------
// extractDateFromURL
// ---------------------------------------------------------------------------

describe("extractDateFromURL", () => {
  it("extracts YYYY/MM/DD from URL path", () => {
    expect(
      extractDateFromURL("https://example.com/news/2021/03/15/article-title"),
    ).toBe(new Date("2021-03-15T00:00:00Z").toISOString());
  });

  it("extracts YYYY/MM/DD at end of path", () => {
    expect(extractDateFromURL("https://example.com/2021/03/15")).toBe(
      new Date("2021-03-15T00:00:00Z").toISOString(),
    );
  });

  it("extracts YYYY/MM/ (year + month only, defaults day to 01)", () => {
    expect(
      extractDateFromURL("https://example.com/archive/2020/07/some-post"),
    ).toBe(new Date("2020-07-01T00:00:00Z").toISOString());
  });

  it("extracts date from ?date= query parameter", () => {
    expect(
      extractDateFromURL("https://example.com/article?date=2019-11-22&id=123"),
    ).toBe(new Date("2019-11-22T00:00:00Z").toISOString());
  });

  it("extracts compact YYYYMMDD from URL path", () => {
    expect(
      extractDateFromURL("https://example.com/news/20210315/article"),
    ).toBe(new Date("2021-03-15T00:00:00Z").toISOString());
  });

  it("extracts date from hyphen-separated segment in path", () => {
    expect(extractDateFromURL("https://example.com/post-2022-08-10-slug")).toBe(
      new Date("2022-08-10T00:00:00Z").toISOString(),
    );
  });

  it("returns null when URL contains no recognisable date", () => {
    expect(extractDateFromURL("https://example.com/about-us")).toBeNull();
  });

  it("returns null for years before 1990", () => {
    expect(extractDateFromURL("https://example.com/1980/01/01/old")).toBeNull();
  });

  it("returns null for invalid month", () => {
    expect(
      extractDateFromURL("https://example.com/2021/13/01/article"),
    ).toBeNull();
  });

  it("returns null for invalid day", () => {
    expect(
      extractDateFromURL("https://example.com/2021/06/00/article"),
    ).toBeNull();
  });

  it("extracts date from Reuters-style slug ending with -YYYY-MM-DD/", () => {
    expect(
      extractDateFromURL(
        "https://www.reuters.com/legal/litigation/moderna-agrees-pay-up-225-billion-settle-covid-vaccine-patent-dispute-2026-03-03/",
      ),
    ).toBe(new Date("2026-03-03T00:00:00Z").toISOString());
  });

  it("extracts date from slug ending with -YYYY-MM-DD (no trailing slash)", () => {
    expect(
      extractDateFromURL(
        "https://www.reuters.com/world/some-article-title-2024-11-05",
      ),
    ).toBe(new Date("2024-11-05T00:00:00Z").toISOString());
  });

  it("ignores 4-digit sequences that are not years (e.g. IDs like /1234/)", () => {
    // /1234/ fails the year < 1990 guard and should return null
    expect(
      extractDateFromURL("https://example.com/products/1234/detail"),
    ).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// extractDateFromPatentHTML
// ---------------------------------------------------------------------------

describe("extractDateFromPatentHTML", () => {
  it("extracts from Justia format: <strong>Date of Patent</strong>: Jul 2, 2002", () => {
    const html = `<strong>Date of Patent</strong>: Jul 2, 2002<br>`;
    expect(extractDateFromPatentHTML(html)).toBe(
      new Date("2002-07-02T00:00:00Z").toISOString(),
    );
  });

  it("extracts from plain inline text: Date of Patent: Jan. 5, 1999", () => {
    const html = `Date of Patent: Jan. 5, 1999`;
    expect(extractDateFromPatentHTML(html)).toBe(
      new Date("1999-01-05T00:00:00Z").toISOString(),
    );
  });

  it("extracts full month name from Justia format", () => {
    const html = `<strong>Date of Patent</strong>: October 15, 1996<br>`;
    expect(extractDateFromPatentHTML(html)).toBe(
      new Date("1996-10-15T00:00:00Z").toISOString(),
    );
  });

  it("returns null when no patent date is present", () => {
    const html = `<html><head><title>No patent date here</title></head></html>`;
    expect(extractDateFromPatentHTML(html)).toBeNull();
  });

  it("returns null for invalid date text", () => {
    const html = `Date of Patent: Xyz. 99, 2002`;
    expect(extractDateFromPatentHTML(html)).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// extractPublishedOnlineDate
// ---------------------------------------------------------------------------

describe("extractPublishedOnlineDate", () => {
  it("extracts 'Published Online: June 29, 2021' (plain text)", () => {
    const html = `Published Online: June 29, 2021`;
    expect(extractPublishedOnlineDate(html)).toBe("2021-06-29T00:00:00.000Z");
  });

  it("extracts when 'Published Online' is wrapped in HTML tags", () => {
    const html = `<span class="label">Published Online:</span> <span>29 June 2021</span>`;
    expect(extractPublishedOnlineDate(html)).toBe("2021-06-29T00:00:00.000Z");
  });

  it("extracts abbreviated month: Published Online: Oct. 13, 2021", () => {
    const html = `Published Online: Oct. 13, 2021`;
    expect(extractPublishedOnlineDate(html)).toBe("2021-10-13T00:00:00.000Z");
  });

  it("returns null when not present", () => {
    const html = `<html><body>No publish date here</body></html>`;
    expect(extractPublishedOnlineDate(html)).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// extractOriginalURLFromArchivePh
// ---------------------------------------------------------------------------

describe("extractOriginalURLFromArchivePh", () => {
  it("extracts original URL from id-before-value attribute order", () => {
    const html = `<input id="url" type="text" value="https://www.reuters.com/2021/03/15/article" name="url">`;
    expect(extractOriginalURLFromArchivePh(html)).toBe(
      "https://www.reuters.com/2021/03/15/article",
    );
  });

  it("extracts original URL from value-before-id attribute order", () => {
    const html = `<input value="https://example.com/news/2022/07/04/story" id="url">`;
    expect(extractOriginalURLFromArchivePh(html)).toBe(
      "https://example.com/news/2022/07/04/story",
    );
  });

  it("returns null when no url input is present", () => {
    const html = `<html><body><p>Some archived content</p></body></html>`;
    expect(extractOriginalURLFromArchivePh(html)).toBeNull();
  });

  it("returns null when value does not start with http", () => {
    const html = `<input id="url" value="/relative/path">`;
    expect(extractOriginalURLFromArchivePh(html)).toBeNull();
  });

  it("handles single-quoted attribute values", () => {
    const html = `<input id='url' value='https://example.com/2023/01/01/post'>`;
    expect(extractOriginalURLFromArchivePh(html)).toBe(
      "https://example.com/2023/01/01/post",
    );
  });

  it("combined: original URL contains a path date that extractDateFromURL can recover", () => {
    const archiveHtml = `<input id="url" value="https://www.reuters.com/legal/moderna-dispute-2026-03-03/">`;
    const originalUrl = extractOriginalURLFromArchivePh(archiveHtml);
    expect(originalUrl).toBe(
      "https://www.reuters.com/legal/moderna-dispute-2026-03-03/",
    );
    expect(extractDateFromURL(originalUrl!)).toBe(
      new Date("2026-03-03T00:00:00Z").toISOString(),
    );
  });
});

// ---------------------------------------------------------------------------
// extractDateFromNextData
// ---------------------------------------------------------------------------

describe("extractDateFromNextData", () => {
  it("extracts 'created' field from ZeroHedge-style __NEXT_DATA__", () => {
    const payload = JSON.stringify({
      props: {
        pageProps: {
          article: {
            created: "2022-08-27T16:30:00-0400",
          },
        },
      },
    });
    const html = `<script id="__NEXT_DATA__" type="application/json">${payload}</script>`;
    expect(extractDateFromNextData(html)).toBe(
      new Date("2022-08-27T16:30:00-0400").toISOString(),
    );
  });

  it("extracts 'publishedAt' field", () => {
    const payload = JSON.stringify({
      props: { pageProps: { post: { publishedAt: "2021-06-15T00:00:00Z" } } },
    });
    const html = `<script id="__NEXT_DATA__" type="application/json">${payload}</script>`;
    expect(extractDateFromNextData(html)).toBe(
      new Date("2021-06-15T00:00:00Z").toISOString(),
    );
  });

  it("extracts 'datePublished' field", () => {
    const payload = JSON.stringify({
      props: { pageProps: { datePublished: "2020-01-01" } },
    });
    const html = `<script id="__NEXT_DATA__" type="application/json">${payload}</script>`;
    expect(extractDateFromNextData(html)).toBe(
      new Date("2020-01-01").toISOString(),
    );
  });

  it("returns null when __NEXT_DATA__ script is absent", () => {
    const html = `<html><body><p>No next data</p></body></html>`;
    expect(extractDateFromNextData(html)).toBeNull();
  });

  it("returns null when __NEXT_DATA__ has no recognised date fields", () => {
    const payload = JSON.stringify({
      props: { pageProps: { title: "Hello" } },
    });
    const html = `<script id="__NEXT_DATA__" type="application/json">${payload}</script>`;
    expect(extractDateFromNextData(html)).toBeNull();
  });

  it("returns null when __NEXT_DATA__ is malformed JSON", () => {
    const html = `<script id="__NEXT_DATA__" type="application/json">{broken</script>`;
    expect(extractDateFromNextData(html)).toBeNull();
  });
});
