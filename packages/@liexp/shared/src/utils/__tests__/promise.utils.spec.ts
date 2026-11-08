import { describe, expect, it } from "vitest";
import { sleep } from "../promise.utils.js";

describe("promise.utils", () => {
  describe("sleep", () => {
    it("should resolve after the specified amount of time", async () => {
      const start = Date.now();
      const ms = 50;
      const te = sleep(ms);
      const result = await te();
      expect(result._tag).toBe("Right");
      const elapsed = Date.now() - start;
      expect(elapsed).toBeGreaterThanOrEqual(ms - 10);
      expect(elapsed).toBeLessThanOrEqual(ms + 100);
    });

    it("should resolve immediately for 0ms", async () => {
      const start = Date.now();
      const te = sleep(0);
      await te();
      const elapsed = Date.now() - start;
      expect(elapsed).toBeLessThan(100);
    });

    it("should return a TaskEither that resolves to void", async () => {
      const te = sleep(10);
      const result = await te();
      expect(result._tag).toBe("Right");
      if (result._tag === "Right") {
        expect(result.right).toBeUndefined();
      }
    });

    it("should return a TaskEither (not throw synchronously)", () => {
      const te = sleep(0);
      expect(te).toBeDefined();
      expect(typeof te).toBe("function");
    });
  });
});
