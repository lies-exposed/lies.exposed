import { describe, expect, it } from "vitest";
import {
  formatDate,
  parseDate,
  formatDateToShort,
  formatAnyDateToShort,
} from "../date.utils.js";

describe("date.utils", () => {
  describe("formatDate", () => {
    it("should format a Date object to yyyy-MM-dd", () => {
      const date = new Date(2024, 0, 15); // January 15, 2024
      expect(formatDate(date)).toBe("2024-01-15");
    });

    it("should return the string as-is if input is already a string", () => {
      expect(formatDate("2024-01-15")).toBe("2024-01-15");
      expect(formatDate("some-other-format")).toBe("some-other-format");
    });

    it("should handle edge dates correctly", () => {
      const firstDay = new Date(2024, 0, 1);
      expect(formatDate(firstDay)).toBe("2024-01-01");

      const lastDay = new Date(2024, 11, 31);
      expect(formatDate(lastDay)).toBe("2024-12-31");
    });
  });

  describe("parseDate", () => {
    it("should parse a yyyy-MM-dd string to a Date", () => {
      const result = parseDate("2024-01-15");
      expect(result.getFullYear()).toBe(2024);
      expect(result.getMonth()).toBe(0); // January is 0
      expect(result.getDate()).toBe(15);
    });

    it("should parse edge dates correctly", () => {
      const firstDay = parseDate("2024-01-01");
      expect(firstDay.getMonth()).toBe(0);
      expect(firstDay.getDate()).toBe(1);

      const lastDay = parseDate("2024-12-31");
      expect(lastDay.getMonth()).toBe(11);
      expect(lastDay.getDate()).toBe(31);
    });
  });

  describe("formatDateToShort", () => {
    it("should format a Date to MMM do yyyy format", () => {
      const date = new Date(2024, 0, 15);
      expect(formatDateToShort(date)).toBe("Jan 15th 2024");
    });

    it("should handle different ordinal suffixes", () => {
      expect(formatDateToShort(new Date(2024, 0, 1))).toBe("Jan 1st 2024");
      expect(formatDateToShort(new Date(2024, 0, 2))).toBe("Jan 2nd 2024");
      expect(formatDateToShort(new Date(2024, 0, 3))).toBe("Jan 3rd 2024");
      expect(formatDateToShort(new Date(2024, 0, 4))).toBe("Jan 4th 2024");
      expect(formatDateToShort(new Date(2024, 0, 21))).toBe("Jan 21st 2024");
      expect(formatDateToShort(new Date(2024, 0, 22))).toBe("Jan 22nd 2024");
    });

    it("should handle all months", () => {
      expect(formatDateToShort(new Date(2024, 5, 15))).toBe("Jun 15th 2024");
      expect(formatDateToShort(new Date(2024, 11, 25))).toBe("Dec 25th 2024");
    });
  });

  describe("formatAnyDateToShort", () => {
    it("should format an ISO string date", () => {
      const result = formatAnyDateToShort("2024-01-15T00:00:00.000Z");
      expect(result).toBe("Jan 15th 2024");
    });

    it("should format a Date object", () => {
      const date = new Date(2024, 0, 15);
      expect(formatAnyDateToShort(date)).toBe("Jan 15th 2024");
    });

    it("should handle different string formats", () => {
      const result = formatAnyDateToShort("2024-06-20");
      expect(result).toBe("Jun 20th 2024");
    });
  });
});
