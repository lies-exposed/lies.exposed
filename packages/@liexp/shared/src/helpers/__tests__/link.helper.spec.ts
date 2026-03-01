import { type URL } from "@liexp/io/lib/http/Common/URL.js";
import { describe, test, expect } from "vitest";
import { isExcludedURL, isPDFURL } from "../link.helper.js";

describe("@helpers/link", () => {
  test("isExcludedURL matches known patterns", () => {
    expect(isExcludedURL("https://t.me/username" as URL)).toBe(true);
    expect(isExcludedURL("https://gab.com/user" as URL)).toBe(true);
    expect(isExcludedURL("https://minds.com/user" as URL)).toBe(true);
    expect(isExcludedURL("https://rumble.com/c/user" as URL)).toBe(true);
  });

  test("isExcludedURL does not match unrelated URLs", () => {
    expect(isExcludedURL("https://example.com" as URL)).toBe(false);
    expect(isExcludedURL("https://youtube.com/user" as URL)).toBe(false);
  });

  test("isExcludedURL does not exclude PDF URLs (they are handled as media)", () => {
    expect(isExcludedURL("https://example.com/report.pdf" as URL)).toBe(false);
    expect(isExcludedURL("https://example.com/report.pdf?v=1" as URL)).toBe(
      false,
    );
  });

  describe("isPDFURL", () => {
    test("matches URLs ending in .pdf", () => {
      expect(isPDFURL("https://example.com/report.pdf" as URL)).toBe(true);
      expect(isPDFURL("https://example.com/REPORT.PDF" as URL)).toBe(true);
      expect(isPDFURL("https://example.com/doc.pdf?version=2" as URL)).toBe(
        true,
      );
      expect(isPDFURL("https://example.com/path/to/file.pdf" as URL)).toBe(
        true,
      );
    });

    test("does not match non-PDF URLs", () => {
      expect(isPDFURL("https://example.com/page" as URL)).toBe(false);
      expect(isPDFURL("https://example.com/image.png" as URL)).toBe(false);
      expect(isPDFURL("https://example.com/doc.pdf.html" as URL)).toBe(false);
    });
  });
});
