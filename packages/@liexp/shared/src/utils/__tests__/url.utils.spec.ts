import { type URL } from "@liexp/io/lib/http/Common/index.js";
import { describe, expect, it } from "vitest";
import {
  sanitizeURL,
  ensureHTTPProtocol,
  extractDateFromUrl,
} from "../url.utils.js";

describe("URL utils", () => {
  describe("sanitizeURL", () => {
    it("should remove utm_ parameters from URL", () => {
      expect(
        sanitizeURL(
          "https://www.telegraph.co.uk/world-news/2023/05/01/geoffrey-hinton-ai-google-artificial-intelligence-chatgpt/?utm_content=xxx&utm_medium=xxx&utm_campaign=xxx&utm_source=xxx&fbclid=xxxx#Echobox=1682972823" as URL,
        ),
      ).toBe(
        "https://www.telegraph.co.uk/world-news/2023/05/01/geoffrey-hinton-ai-google-artificial-intelligence-chatgpt/",
      );
    });

    it("should preserve non-tracking query parameters", () => {
      expect(
        sanitizeURL(
          "https://www.telegraph.co.uk/world-news/2023/05/01/?item=geoffrey-hinton-ai-google-artificial-intelligence-chatgpt&utm_content=xxx&utm_medium=xxx&utm_campaign=xxx&utm_source=xxx&fbclid=xxxx#Echobox=1682972823" as URL,
        ),
      ).toBe(
        "https://www.telegraph.co.uk/world-news/2023/05/01/?item=geoffrey-hinton-ai-google-artificial-intelligence-chatgpt",
      );
    });

    it("should remove fbclid parameter", () => {
      expect(
        sanitizeURL(
          "https://example.com/page?fbclid=abc123&valid=param" as URL,
        ),
      ).toBe("https://example.com/page?valid=param");
    });

    it("should handle URLs without query parameters", () => {
      expect(sanitizeURL("https://example.com/page" as URL)).toBe(
        "https://example.com/page",
      );
    });

    it("should handle URLs with only tracking parameters", () => {
      expect(
        sanitizeURL(
          "https://example.com/page?utm_source=twitter&utm_campaign=test" as URL,
        ),
      ).toBe("https://example.com/page");
    });
  });

  describe("ensureHTTPProtocol", () => {
    it("should return URL as-is if it starts with https://", () => {
      expect(ensureHTTPProtocol("https://example.com")).toBe(
        "https://example.com",
      );
    });

    it("should return URL as-is if it starts with http://", () => {
      expect(ensureHTTPProtocol("http://example.com")).toBe(
        "http://example.com",
      );
    });

    it("should add https: prefix if URL starts with //", () => {
      expect(ensureHTTPProtocol("//example.com/path")).toBe(
        "https://example.com/path",
      );
    });

    it("should add https:// prefix if URL has no protocol", () => {
      expect(ensureHTTPProtocol("example.com")).toBe("https://example.com");
      expect(ensureHTTPProtocol("www.example.com/path")).toBe(
        "https://www.example.com/path",
      );
    });

    it("should handle URLs with paths", () => {
      expect(ensureHTTPProtocol("example.com/path/to/page")).toBe(
        "https://example.com/path/to/page",
      );
    });

    it("should handle URLs with query parameters", () => {
      expect(ensureHTTPProtocol("example.com/page?foo=bar")).toBe(
        "https://example.com/page?foo=bar",
      );
    });
  });

  describe("extractDateFromUrl", () => {
    it("extracts /YYYY/MM/DD/ path", () => {
      expect(
        extractDateFromUrl("https://example.com/news/2023/07/26/some-article/"),
      ).toEqual(new Date("2023-07-26T00:00:00.000Z"));
    });

    it("extracts /YYYY/mon/DD/ path (month abbreviation)", () => {
      expect(
        extractDateFromUrl("https://www.guardian.com/world/2025/jul/26/story"),
      ).toEqual(new Date("2025-07-26T00:00:00.000Z"));
    });

    it("extracts /YYYY/MM/DD without trailing slash", () => {
      expect(extractDateFromUrl("https://example.com/2021/08/15")).toEqual(
        new Date("2021-08-15T00:00:00.000Z"),
      );
    });

    it("extracts underscore-separated date", () => {
      expect(
        extractDateFromUrl("https://www.who.int/csr/don/2009_04_26/en/"),
      ).toEqual(new Date("2009-04-26T00:00:00.000Z"));
    });

    it("extracts compact YYYYMMDD from Wayback Machine timestamp", () => {
      expect(
        extractDateFromUrl(
          "https://web.archive.org/web/20190516150836/https://example.com/",
        ),
      ).toEqual(new Date("2019-05-16T00:00:00.000Z"));
    });

    it("prefers original URL date over Wayback Machine capture date", () => {
      expect(
        extractDateFromUrl(
          "https://web.archive.org/web/20190516150836/https://www.who.int/csr/don/2009_04_26/en/",
        ),
      ).toEqual(new Date("2009-04-26T00:00:00.000Z"));
    });

    it("returns null when no date pattern matches", () => {
      expect(
        extractDateFromUrl("https://www.nih.gov/news-events/press-release"),
      ).toBeNull();
    });
  });
});
