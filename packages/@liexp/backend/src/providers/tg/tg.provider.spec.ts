import { TelegramApiError } from "node-telegram-bot-api";
import { describe, expect, it } from "vitest";
import { TGError, toTGError } from "./tg.provider.js";

describe("tg.provider", () => {
  describe("TGError", () => {
    it("should have name TGError", () => {
      const error = toTGError(new Error("Test"));
      expect(error.name).toBe("TGError");
    });
  });

  describe("toTGError", () => {
    it("should return TGError with default message", () => {
      const error = toTGError(new Error("Test error"));
      expect(error.name).toBe("TGError");
      expect(error.message).toBe("Unknown telegram error");
    });

    it("should handle ETELEGRAM errors", () => {
      const telegramError = new TelegramApiError(
        403,
        "Bot was blocked by the user",
        {
          response: {},
        },
      );

      const result = toTGError(telegramError);
      expect(result).toHaveProperty("description");
      expect(result).toHaveProperty("code");
      expect(result.code).toBe("ETELEGRAM");
    });

    it("should include meta with original error", () => {
      const error = toTGError("some string error");
      expect(error).toBeInstanceOf(TGError);
    });

    it("should handle null value", () => {
      const error = toTGError(null);
      expect(error).toBeInstanceOf(TGError);
    });

    it("should handle undefined value", () => {
      const error = toTGError(undefined);
      expect(error).toBeInstanceOf(TGError);
    });

    it("should handle object without code", () => {
      const error = toTGError({ message: "Some error" });
      expect(error).toBeInstanceOf(TGError);
    });

    it("should handle number value", () => {
      const error = toTGError(500);
      expect(error).toBeInstanceOf(TGError);
    });

    it("should handle boolean false value", () => {
      const error = toTGError(false);
      expect(error).toBeInstanceOf(TGError);
    });

    it("should handle array value", () => {
      const error = toTGError(["error1", "error2"]);
      expect(error).toBeInstanceOf(TGError);
    });
  });
});
