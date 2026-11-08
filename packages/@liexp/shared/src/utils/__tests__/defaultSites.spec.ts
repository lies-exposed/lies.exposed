import { describe, expect, it } from "vitest";
import { defaultSites } from "../defaultSites.js";

describe("defaultSites", () => {
  it("should export theguardian site", () => {
    expect(defaultSites.the_guardian).toBe("www.theguardian.com");
  });

  it("should export reuters site", () => {
    expect(defaultSites.reuters).toBe("www.reuters.com");
  });

  it("should have exactly two entries", () => {
    expect(Object.keys(defaultSites)).toHaveLength(2);
  });

  it("should have string values for all entries", () => {
    for (const key of Object.keys(defaultSites)) {
      expect(typeof defaultSites[key]).toBe("string");
    }
  });
});
