import { describe, expect, test } from "vitest";
import { toPinnedMessage } from "../upsertPinnedMessage.flow.js";

describe("Upsert Pinned Message Flow", () => {
  describe("toPinnedMessage", () => {
    test("should format pinned message with bot username and keywords", () => {
      const result = toPinnedMessage({
        bot: "@mybot",
        keywords: [
          { tag: "covid", eventCount: 42 },
          { tag: "climate", eventCount: 17 },
        ],
        keywordLimit: 5,
      });

      expect(result).toContain("@mybot");
      expect(result).toContain("#covid (42)");
      expect(result).toContain("#climate (17)");
      expect(result).toContain("TOP 5");
    });

    test("should render empty keyword list without errors", () => {
      const result = toPinnedMessage({
        bot: "@testbot",
        keywords: [],
        keywordLimit: 10,
      });

      expect(result).toContain("@testbot");
      expect(result).toContain("TOP 10");
    });
  });
});
