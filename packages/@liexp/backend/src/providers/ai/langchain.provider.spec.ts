import { describe, expect, it, vi } from "vitest";

vi.mock("@langchain/openai", () => {
  const ChatOpenAI = vi.fn().mockImplementation(function (this: any, opts: any) {
    this.model = opts?.model;
    this.stream = vi.fn().mockResolvedValue({ [Symbol.asyncIterator]: async function* () {} });
    this.invoke = vi.fn();
  });
  const OpenAIEmbeddings = vi.fn().mockImplementation(function (this: any, opts: any) {
    this.model = opts?.model;
  });
  return { ChatOpenAI, OpenAIEmbeddings };
});

vi.mock("@langchain/anthropic", () => {
  const ChatAnthropic = vi.fn().mockImplementation(function (this: any, opts: any) {
    this.model = opts?.model;
    this.stream = vi.fn();
    this.invoke = vi.fn();
  });
  return { ChatAnthropic };
});

vi.mock("@langchain/xai", () => {
  const ChatXAI = vi.fn().mockImplementation(function (this: any, opts: any) {
    this.model = opts?.model;
    this.stream = vi.fn();
    this.invoke = vi.fn();
  });
  return { ChatXAI };
});

import { EMBEDDINGS_PROMPT, GetLangchainProvider } from "./langchain.provider.js";

const baseOpts = {
  baseURL: "https://api.example.com",
  apiKey: "sk-test-key-1234567890",
  provider: "openai" as const,
};

describe("EMBEDDINGS_PROMPT", () => {
  it("renders text and question into the template", () => {
    const result = EMBEDDINGS_PROMPT({
      vars: { text: "Some climate context", question: "What is global warming?" },
    });

    expect(result).toContain("Some climate context");
    expect(result).toContain("What is global warming?");
  });

  it("includes instruction to limit answer to 300 chars", () => {
    const result = EMBEDDINGS_PROMPT({ vars: { text: "context", question: "q?" } });
    expect(result).toContain("300 chars");
  });

  it("includes instruction to say unknown when no answer available", () => {
    const result = EMBEDDINGS_PROMPT({ vars: { text: "irrelevant", question: "q?" } });
    expect(result).toContain("don't know");
  });

  it("includes Answer label", () => {
    const result = EMBEDDINGS_PROMPT({ vars: { text: "ctx", question: "q?" } });
    expect(result).toContain("Answer:");
  });
});

describe("GetLangchainProvider", () => {
  it("returns object with chat, embeddings, queryDocument, and options", () => {
    const provider = GetLangchainProvider(baseOpts);
    expect(provider.chat).toBeDefined();
    expect(provider.embeddings).toBeDefined();
    expect(typeof provider.queryDocument).toBe("function");
    expect(provider.options).toBe(baseOpts);
  });

  it("uses gpt-4o as default chat model for openai provider", () => {
    const provider = GetLangchainProvider(baseOpts);
    expect((provider.chat as any).model).toBe("gpt-4o");
  });

  it("uses claude-sonnet as default chat model for anthropic provider", () => {
    const provider = GetLangchainProvider({ ...baseOpts, provider: "anthropic" });
    expect((provider.chat as any).model).toContain("claude");
  });

  it("uses custom chat model when provided", () => {
    const provider = GetLangchainProvider({
      ...baseOpts,
      models: { chat: "gpt-4o-mini" },
    });
    expect((provider.chat as any).model).toBe("gpt-4o-mini");
  });

  it("uses text-embedding-ada-002 as default embedding model", () => {
    const provider = GetLangchainProvider(baseOpts);
    expect((provider.embeddings as any).model).toBe("text-embedding-ada-002");
  });

  it("uses custom embedding model when provided", () => {
    const provider = GetLangchainProvider({
      ...baseOpts,
      models: { embeddings: "text-embedding-3-small" },
    });
    expect((provider.embeddings as any).model).toBe("text-embedding-3-small");
  });

  describe("queryDocument", () => {
    it("returns empty string when the chat stream yields nothing", async () => {
      const provider = GetLangchainProvider(baseOpts);
      const result = await provider.queryDocument([], "q?");
      expect(typeof result).toBe("string");
    });

    it("accepts optional model override", async () => {
      const provider = GetLangchainProvider(baseOpts);
      // Should not throw when called with a custom model
      const result = await provider.queryDocument(
        [],
        "question",
        { model: "gpt-4o-mini" },
      );
      expect(typeof result).toBe("string");
    });
  });
});
