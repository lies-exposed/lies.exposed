import * as coreLogger from "@liexp/core/lib/logger/index.js";
import { Schema } from "effect";
import * as E from "fp-ts/lib/Either.js";
import { describe, expect, it, vi } from "vitest";
import { GetCSVUtil } from "./csv.utils.js";

vi.mock("fast-csv", () => ({
  default: {
    parseFile: vi.fn().mockReturnThis(),
    parseString: vi.fn().mockReturnThis(),
    writeToPath: vi.fn().mockReturnThis(),
    on: vi.fn().mockReturnThis(),
  },
}));

const logger = coreLogger.GetLogger("test");
const csvUtil = GetCSVUtil({ log: logger });

const PersonSchema = Schema.Struct({
  name: Schema.String,
  age: Schema.Number,
});

describe("csv.utils", () => {
  describe("parseFile", () => {
    it("should return Left for non-existent file", async () => {
      const result = await csvUtil.parseFile(
        "/non/existent/file.csv",
        { headers: true },
        { decoder: PersonSchema },
      )();
      expect(E.isLeft(result)).toBe(true);
    });
  });

  describe("writeToPath", () => {
    it("should return Left for invalid output path", async () => {
      const result = await csvUtil.writeToPath("/invalid//path/file.csv", [
        { name: "John", age: 30 },
      ])();
      expect(E.isLeft(result)).toBe(true);
    });

    it("should return Left for empty array", async () => {
      const result = await csvUtil.writeToPath("/tmp/test.csv", [])();
      expect(E.isLeft(result)).toBe(true);
    });
  });
});
