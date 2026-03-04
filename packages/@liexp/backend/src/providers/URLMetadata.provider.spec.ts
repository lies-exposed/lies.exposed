import { describe, expect, it } from "vitest";
import { extractDateFromHTML } from "./URLMetadata.provider.js";

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

  it("extracts datePublished from JSON-LD", () => {
    const html = `<script type="application/ld+json">{"@type":"Article","datePublished":"2024-02-14T09:00:00Z"}</script>`;
    expect(extractDateFromHTML(html)).toBe(
      new Date("2024-02-14T09:00:00Z").toISOString(),
    );
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
