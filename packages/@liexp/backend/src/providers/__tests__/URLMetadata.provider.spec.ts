import { describe, expect, it } from "vitest";
import {
  extractDateFromURL,
  extractDateFromJSONLD,
  extractOriginalURLFromArchivePh,
  extractDateFromHTML,
  extractDateFromPatentHTML,
  extractPublishedOnlineDate,
  extractDateFromNextData,
} from "../URLMetadata.provider.js";

describe("extractDateFromURL", () => {
  it("extracts date from /YYYY/MM/DD/ path pattern", () => {
    const result = extractDateFromURL("https://example.com/2021/03/15/article");
    expect(result).toBeDefined();
    expect(result).toContain("2021-03-15");
  });

  it("extracts date from path ending with /YYYY/MM/DD", () => {
    const result = extractDateFromURL("https://example.com/2021/03/15");
    expect(result).toBeDefined();
    expect(result).toContain("2021-03-15");
  });

  it("extracts date from /YYYY/MM/ pattern", () => {
    const result = extractDateFromURL("https://example.com/2021/03/");
    expect(result).toBeDefined();
    expect(result).toContain("2021-03-01");
  });

  it("extracts date from query string ?date=YYYY-MM-DD", () => {
    const result = extractDateFromURL("https://example.com?date=2021-03-15");
    expect(result).toBeDefined();
    expect(result).toContain("2021-03-15");
  });

  it("extracts date from path with -YYYY-MM-DD", () => {
    const result = extractDateFromURL("https://example.com/article-2021-03-15");
    expect(result).toBeDefined();
    expect(result).toContain("2021-03-15");
  });

  it("extracts date from compact YYYYMMDD pattern", () => {
    const result = extractDateFromURL("https://example.com/20210315/");
    expect(result).toBeDefined();
    expect(result).toContain("2021-03-15");
  });

  it("returns null for invalid year (too old)", () => {
    const result = extractDateFromURL("https://example.com/1800/01/01/");
    expect(result).toBeNull();
  });

  it("returns null for invalid month", () => {
    const result = extractDateFromURL("https://example.com/2021/13/01/");
    expect(result).toBeNull();
  });

  it("returns null for invalid day", () => {
    const result = extractDateFromURL("https://example.com/2021/01/32/");
    expect(result).toBeNull();
  });

  it("returns null when no date pattern matches", () => {
    const result = extractDateFromURL("https://example.com/article/slug");
    expect(result).toBeNull();
  });
});

describe("extractDateFromJSONLD", () => {
  it("extracts datePublished from JSON-LD", () => {
    const html = `<script type="application/ld+json">{"datePublished": "2021-03-15T00:00:00Z"}</script>`;
    const result = extractDateFromJSONLD(html);
    expect(result).toBeDefined();
    expect(result).toContain("2021-03-15");
  });

  it("extracts dateCreated from JSON-LD", () => {
    const html = `<script type="application/ld+json">{"dateCreated": "2021-03-15T00:00:00Z"}</script>`;
    const result = extractDateFromJSONLD(html);
    expect(result).toBeDefined();
    expect(result).toContain("2021-03-15");
  });

  it("extracts date from nested @graph", () => {
    const html = `<script type="application/ld+json">{"@graph":[{"datePublished": "2021-03-15T00:00:00Z"}]}</script>`;
    const result = extractDateFromJSONLD(html);
    expect(result).toBeDefined();
    expect(result).toContain("2021-03-15");
  });

  it("returns null for malformed JSON", () => {
    const html = `<script type="application/ld+json">{invalid json}</script>`;
    const result = extractDateFromJSONLD(html);
    expect(result).toBeNull();
  });

  it("returns null when no date fields present", () => {
    const html = `<script type="application/ld+json">{"@context": "https://schema.org"}</script>`;
    const result = extractDateFromJSONLD(html);
    expect(result).toBeNull();
  });

  it("returns null for invalid HTML", () => {
    const result = extractDateFromJSONLD("no script tags");
    expect(result).toBeNull();
  });
});

describe("extractOriginalURLFromArchivePh", () => {
  it("extracts original URL from archive.ph page", () => {
    const html = `<input id="url" value="https://example.com/original">`;
    const result = extractOriginalURLFromArchivePh(html);
    expect(result).toBe("https://example.com/original");
  });

  it("extracts URL when value comes before id", () => {
    const html = `<input value="https://example.com/original" id="url">`;
    const result = extractOriginalURLFromArchivePh(html);
    expect(result).toBe("https://example.com/original");
  });

  it("returns null for non-https URL", () => {
    const html = `<input id="url" value="ftp://example.com/original">`;
    const result = extractOriginalURLFromArchivePh(html);
    expect(result).toBeNull();
  });

  it("returns null when no archive ph URL found", () => {
    const html = `<input id="other" value="https://example.com/original">`;
    const result = extractOriginalURLFromArchivePh(html);
    expect(result).toBeNull();
  });

  it("returns null for empty HTML", () => {
    const result = extractOriginalURLFromArchivePh("");
    expect(result).toBeNull();
  });
});

describe("extractDateFromHTML", () => {
  it("extracts date from article:published_time meta tag", () => {
    const html = `<meta property="article:published_time" content="2021-03-15T00:00:00Z">`;
    const result = extractDateFromHTML(html);
    expect(result).toBeDefined();
    expect(result).toContain("2021-03-15");
  });

  it("extracts date from name=article:published_time", () => {
    const html = `<meta name="article:published_time" content="2021-03-15T00:00:00Z">`;
    const result = extractDateFromHTML(html);
    expect(result).toBeDefined();
    expect(result).toContain("2021-03-15");
  });

  it("extracts date from itemprop=datePublished", () => {
    const html = `<meta itemprop="datePublished" content="2021-03-15T00:00:00Z">`;
    const result = extractDateFromHTML(html);
    expect(result).toBeDefined();
    expect(result).toContain("2021-03-15");
  });

  it("extracts date from time itemprop=datePublished datetime", () => {
    const html = `<time itemprop="datePublished" datetime="2021-03-15">`;
    const result = extractDateFromHTML(html);
    expect(result).toBeDefined();
    expect(result).toContain("2021-03-15");
  });

  it("extracts date from meta name=date", () => {
    const html = `<meta name="date" content="2021-03-15">`;
    const result = extractDateFromHTML(html);
    expect(result).toBeDefined();
    expect(result).toContain("2021-03-15");
  });

  it("extracts date from Dublin Core dc.date", () => {
    const html = `<meta name="dc.date" content="2021-03-15">`;
    const result = extractDateFromHTML(html);
    expect(result).toBeDefined();
    expect(result).toContain("2021-03-15");
  });

  it("extracts date from citation_publication_date", () => {
    const html = `<meta name="citation_publication_date" content="2021/03/15">`;
    const result = extractDateFromHTML(html);
    expect(result).toBeDefined();
    expect(result).toContain("2021-03-15");
  });

  it("returns null when no date patterns match", () => {
    const html = `<html><body>no date here</body></html>`;
    const result = extractDateFromHTML(html);
    expect(result).toBeNull();
  });
});

describe("extractDateFromPatentHTML", () => {
  it("extracts date from 'Date of Patent' format", () => {
    const html = `<strong>Date of Patent</strong>: Jul 2, 2002`;
    const result = extractDateFromPatentHTML(html);
    expect(result).toBeDefined();
    expect(result).toContain("2002-07-02");
  });

  it("extracts date with abbreviated month", () => {
    const html = `<strong>Date of Patent</strong>: Oct. 15, 1996`;
    const result = extractDateFromPatentHTML(html);
    expect(result).toBeDefined();
    expect(result).toContain("1996-10-15");
  });

  it("returns null when no patent date found", () => {
    const html = `<html><body>no patent date</body></html>`;
    const result = extractDateFromPatentHTML(html);
    expect(result).toBeNull();
  });
});

describe("extractPublishedOnlineDate", () => {
  it("extracts date from 'Published Online' format", () => {
    const html = `Published Online: March 15, 2021`;
    const result = extractPublishedOnlineDate(html);
    expect(result).toBeDefined();
    expect(result).toContain("2021-03-15");
  });

  it("extracts date with DD Month YYYY format", () => {
    const html = `Published Online: 15 March 2021`;
    const result = extractPublishedOnlineDate(html);
    expect(result).toBeDefined();
    expect(result).toContain("2021-03-15");
  });

  it("returns null when no published online date found", () => {
    const html = `<html><body>no date</body></html>`;
    const result = extractPublishedOnlineDate(html);
    expect(result).toBeNull();
  });
});

describe("extractDateFromNextData", () => {
  it("extracts date from __NEXT_DATA__ created field", () => {
    const html = `<script id="__NEXT_DATA__" type="application/json">{"props":{"page":"home"},"runtimeConfig":{},"created":"2021-03-15T00:00:00Z"}</script>`;
    const result = extractDateFromNextData(html);
    expect(result).toBeDefined();
    expect(result).toContain("2021-03-15");
  });

  it("extracts date from __NEXT_DATA__ publishedAt field", () => {
    const html = `<script id="__NEXT_DATA__" type="application/json">{"publishedAt":"2021-03-15T00:00:00Z"}</script>`;
    const result = extractDateFromNextData(html);
    expect(result).toBeDefined();
    expect(result).toContain("2021-03-15");
  });

  it("extracts date from __NEXT_DATA__ published_at field", () => {
    const html = `<script id="__NEXT_DATA__" type="application/json">{"published_at":"2021-03-15T00:00:00Z"}</script>`;
    const result = extractDateFromNextData(html);
    expect(result).toBeDefined();
    expect(result).toContain("2021-03-15");
  });

  it("returns null when no __NEXT_DATA__ script found", () => {
    const html = `<html><body>no next data</body></html>`;
    const result = extractDateFromNextData(html);
    expect(result).toBeNull();
  });

  it("returns null for malformed JSON", () => {
    const html = `<script id="__NEXT_DATA__" type="application/json">{invalid}</script>`;
    const result = extractDateFromNextData(html);
    expect(result).toBeNull();
  });
});
