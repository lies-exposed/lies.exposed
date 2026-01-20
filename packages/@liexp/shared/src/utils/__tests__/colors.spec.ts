import { describe, expect, it } from "vitest";
import { generateRandomColor, toColor, toColorHash } from "../colors.js";

describe("colors", () => {
  describe("generateRandomColor", () => {
    it("should generate a valid 6-character hex color", () => {
      const color = generateRandomColor();
      expect(color).toMatch(/^[0-9a-f]{6}$/i);
    });

    it("should generate different colors on subsequent calls", () => {
      const colors = new Set<string>();
      for (let i = 0; i < 100; i++) {
        colors.add(generateRandomColor());
      }
      // With 100 random colors, we should have multiple unique values
      expect(colors.size).toBeGreaterThan(1);
    });
  });

  describe("toColor", () => {
    it("should remove # prefix if present", () => {
      expect(toColor("#ff0000")).toBe("ff0000");
      expect(toColor("#abc123")).toBe("abc123");
    });

    it("should return the string as-is if no # prefix", () => {
      expect(toColor("ff0000")).toBe("ff0000");
      expect(toColor("abc123")).toBe("abc123");
    });

    it("should handle empty or undefined-like strings", () => {
      expect(toColor("")).toBe("");
    });
  });

  describe("toColorHash", () => {
    it("should add # prefix if not present", () => {
      expect(toColorHash("ff0000")).toBe("#ff0000");
      expect(toColorHash("abc123")).toBe("#abc123");
    });

    it("should return the string as-is if # prefix already present", () => {
      expect(toColorHash("#ff0000")).toBe("#ff0000");
      expect(toColorHash("#abc123")).toBe("#abc123");
    });

    it("should handle empty strings", () => {
      expect(toColorHash("")).toBe("#");
    });
  });
});
