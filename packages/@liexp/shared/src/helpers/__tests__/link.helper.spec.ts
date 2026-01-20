import { type URL } from "@liexp/io/lib/http/Common/URL.js";
import { describe, test, expect } from "vitest";
import { isExcludedURL } from "../link.helper.js";

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
});
