import { describe, expect, it } from "vitest";
import { numTicksForHeight, numTicksForWidth } from "../graph.utils.js";

describe("graph.utils", () => {
  describe("numTicksForHeight", () => {
    it("should return 3 for heights <= 300", () => {
      expect(numTicksForHeight(100)).toBe(3);
      expect(numTicksForHeight(200)).toBe(3);
      expect(numTicksForHeight(300)).toBe(3);
    });

    it("should return 5 for heights between 301 and 600", () => {
      expect(numTicksForHeight(301)).toBe(5);
      expect(numTicksForHeight(400)).toBe(5);
      expect(numTicksForHeight(500)).toBe(5);
      expect(numTicksForHeight(600)).toBe(5);
    });

    it("should return 10 for heights > 600", () => {
      expect(numTicksForHeight(601)).toBe(10);
      expect(numTicksForHeight(800)).toBe(10);
      expect(numTicksForHeight(1000)).toBe(10);
    });
  });

  describe("numTicksForWidth", () => {
    it("should return 2 for widths <= 300", () => {
      expect(numTicksForWidth(100)).toBe(2);
      expect(numTicksForWidth(200)).toBe(2);
      expect(numTicksForWidth(300)).toBe(2);
    });

    it("should return 5 for widths between 301 and 400", () => {
      expect(numTicksForWidth(301)).toBe(5);
      expect(numTicksForWidth(350)).toBe(5);
      expect(numTicksForWidth(400)).toBe(5);
    });

    it("should return 10 for widths > 400", () => {
      expect(numTicksForWidth(401)).toBe(10);
      expect(numTicksForWidth(600)).toBe(10);
      expect(numTicksForWidth(1000)).toBe(10);
    });
  });
});
