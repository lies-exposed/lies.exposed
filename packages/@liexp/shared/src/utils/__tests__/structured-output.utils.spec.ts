import * as Schema from "effect";
import { describe, expect, it, vi } from "vitest";
import type {
  StructuredOutputStrategyType,
  ToolStrategyOptions,
} from "../structured-output.utils.js";
import {
  createProviderStrategy,
  createToolStrategy,
  createStructuredOutputStrategy,
} from "../structured-output.utils.js";

// Mock langchain
vi.mock("langchain", () => ({
  providerStrategy: vi.fn((zodSchema: any) => ({
    type: "provider",
    zodSchema,
  })),
  toolStrategy: vi.fn((zodSchema: any, options?: ToolStrategyOptions) => [
    {
      type: "tool",
      zodSchema,
      toolMessageContent: options?.toolMessageContent,
      handleError: options?.handleError,
    },
  ]),
}));

// Mock schema.utils
vi.mock("../schema.utils.js", () => ({
  effectToZodObject: vi.fn((fields: any) => ({
    zodType: "converted",
    fields,
  })),
}));

describe("structured-output.utils", () => {
  describe("StructuredOutputStrategyType", () => {
    it("should be 'provider' or 'tool'", () => {
      const provider: StructuredOutputStrategyType = "provider";
      const tool: StructuredOutputStrategyType = "tool";
      expect(provider).toBe("provider");
      expect(tool).toBe("tool");
    });
  });

  describe("createProviderStrategy", () => {
    it("should call providerStrategy with converted zod object", () => {
      const fields = {
        name: Schema.String,
        age: Schema.Number,
      };

      const result = createProviderStrategy(fields);

      expect(result.type).toBe("provider");
      expect(result.zodSchema).toEqual({
        zodType: "converted",
        fields,
      });
    });

    it("should handle empty fields", () => {
      const fields = {};
      const result = createProviderStrategy(fields);
      expect(result.type).toBe("provider");
    });
  });

  describe("createToolStrategy", () => {
    it("should call toolStrategy with converted zod object", () => {
      const fields = {
        title: Schema.String,
        body: Schema.String,
      };

      const result = createToolStrategy(fields);

      expect(Array.isArray(result)).toBe(true);
      expect(result[0].type).toBe("tool");
      expect(result[0].zodSchema).toEqual({
        zodType: "converted",
        fields,
      });
    });

    it("should pass toolMessageContent when provided", () => {
      const fields = { name: Schema.String };
      const options: ToolStrategyOptions = {
        toolMessageContent: "Custom message",
      };

      const result = createToolStrategy(fields, options);
      expect(result[0].toolMessageContent).toBe("Custom message");
    });

    it("should pass handleError=true when provided", () => {
      const fields = { name: Schema.String };
      const options: ToolStrategyOptions = {
        handleError: true,
      };

      const result = createToolStrategy(fields, options);
      expect(result[0].handleError).toBe(true);
    });

    it("should pass handleError string when provided", () => {
      const fields = { name: Schema.String };
      const options: ToolStrategyOptions = {
        handleError: "Retry message",
      };

      const result = createToolStrategy(fields, options);
      expect(result[0].handleError).toBe("Retry message");
    });

    it("should handle undefined options", () => {
      const fields = { name: Schema.String };
      const result = createToolStrategy(fields, undefined);
      expect(result[0].toolMessageContent).toBeUndefined();
      expect(result[0].handleError).toBeUndefined();
    });
  });

  describe("createStructuredOutputStrategy", () => {
    it("should default to tool strategy", () => {
      const fields = { name: Schema.String };
      const result = createStructuredOutputStrategy(fields);

      expect(Array.isArray(result)).toBe(true);
      expect(result[0].type).toBe("tool");
    });

    it("should use provider strategy when specified", () => {
      const fields = { name: Schema.String };
      const result = createStructuredOutputStrategy(fields, "provider");

      expect(result.type).toBe("provider");
    });

    it("should use tool strategy when explicitly specified", () => {
      const fields = { name: Schema.String };
      const result = createStructuredOutputStrategy(fields, "tool");

      expect(Array.isArray(result)).toBe(true);
      expect(result[0].type).toBe("tool");
    });

    it("should pass options to tool strategy", () => {
      const fields = { name: Schema.String };
      const options: ToolStrategyOptions = {
        toolMessageContent: "test",
      };
      const result = createStructuredOutputStrategy(fields, "tool", options);

      expect(result[0].toolMessageContent).toBe("test");
    });

    it("should not pass options to provider strategy", () => {
      const fields = { name: Schema.String };
      const options: ToolStrategyOptions = {
        toolMessageContent: "test",
      };
      const result = createStructuredOutputStrategy(
        fields,
        "provider",
        options,
      );

      expect(result.type).toBe("provider");
    });
  });
});
