import { describe, expect, it } from "vitest";
import { convertTitleToId, StoryUtils } from "../story.utils.js";

describe("story.utils", () => {
  describe("convertTitleToId", () => {
    it("should convert a simple title to kebab-case", () => {
      expect(convertTitleToId("Hello World")).toBe("hello-world");
    });

    it("should handle multiple spaces", () => {
      expect(convertTitleToId("Hello   World")).toBe("hello-world");
    });

    it("should handle special characters", () => {
      expect(convertTitleToId("Hello, World!")).toBe("hello-world");
      expect(convertTitleToId("Test & Example")).toBe("test-example");
    });

    it("should handle numbers", () => {
      expect(convertTitleToId("Chapter 1")).toBe("chapter-1");
      expect(convertTitleToId("2024 Report")).toBe("2024-report");
    });

    it("should handle already kebab-case strings", () => {
      expect(convertTitleToId("hello-world")).toBe("hello-world");
    });

    it("should handle uppercase strings", () => {
      expect(convertTitleToId("HELLO WORLD")).toBe("hello-world");
    });

    it("should handle camelCase strings", () => {
      expect(convertTitleToId("helloWorld")).toBe("hello-world");
    });

    it("should handle empty strings", () => {
      expect(convertTitleToId("")).toBe("");
    });
  });

  describe("StoryUtils", () => {
    it("should expose convertTitleToId function", () => {
      expect(StoryUtils.convertTitleToId).toBe(convertTitleToId);
      expect(StoryUtils.convertTitleToId("Test Title")).toBe("test-title");
    });
  });
});
