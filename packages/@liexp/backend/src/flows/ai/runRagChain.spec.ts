import type { Messages } from "@langchain/langgraph";
import { throwTE } from "@liexp/shared/lib/utils/fp.utils.js";
import { describe, expect, it, vi } from "vitest";
import type { LoggerContext } from "../../context/logger.context.js";
import type { Agent } from "../../providers/ai/agent.factory.js";
import { processChunk, runAgent } from "./runRagChain.js";

const createMockContext = () => ({
  logger: {
    info: { log: vi.fn() },
    debug: { log: vi.fn() },
    warn: { log: vi.fn() },
    error: { log: vi.fn() },
    extend: vi.fn().mockReturnThis(),
  },
});

const makeAsyncIterable = (chunks: any[]) => ({
  [Symbol.asyncIterator]: function* () {
    for (const chunk of chunks) yield chunk;
  },
});

describe("runAgent", () => {
  describe("stream mode (default)", () => {
    it("returns empty string when stream yields no known chunks", async () => {
      const chain = {
        stream: vi.fn().mockResolvedValue(makeAsyncIterable([])),
        invoke: vi.fn(),
      };
      const ctx = createMockContext();

      const result = await throwTE(
        runAgent(
          [{ role: "user", content: "hello" }] as Messages,
          chain as Agent,
        )(ctx as LoggerContext),
      );

      expect(result).toBe("");
      expect(chain.stream).toHaveBeenCalledWith(
        { messages: expect.any(Array) },
        { configurable: { thread_id: expect.any(String) } },
      );
    });

    it("accumulates agent chunks", async () => {
      const chain = {
        stream: vi
          .fn()
          .mockResolvedValue(
            makeAsyncIterable([{ agent: "first" }, { agent: "second" }]),
          ),
        invoke: vi.fn(),
      };
      const ctx = createMockContext();

      const result = await throwTE(
        runAgent([] as Messages, chain as Agent)(ctx as LoggerContext),
      );

      expect(result).toContain('"first"');
      expect(result).toContain('"second"');
    });

    it("captures structured response from generate_structured_response chunk", async () => {
      const structuredResponse = { title: "Test Event", date: "2024-01-01" };
      const chain = {
        stream: vi
          .fn()
          .mockResolvedValue(
            makeAsyncIterable([
              { generate_structured_response: { structuredResponse } },
            ]),
          ),
        invoke: vi.fn(),
      };
      const ctx = createMockContext();

      const result = await throwTE(
        runAgent([] as Messages, chain as Agent)(ctx as LoggerContext),
      );

      expect(result).toBe(JSON.stringify(structuredResponse));
    });

    it("structured response chunk overrides accumulated agent output", async () => {
      const structured = { final: "answer" };
      const chain = {
        stream: vi.fn().mockResolvedValue(
          makeAsyncIterable([
            { agent: "preliminary" },
            {
              generate_structured_response: {
                structuredResponse: structured,
              },
            },
          ]),
        ),
        invoke: vi.fn(),
      };
      const ctx = createMockContext();

      const result = await throwTE(
        runAgent([] as Messages, chain as Agent)(ctx as LoggerContext),
      );

      expect(result).toBe(JSON.stringify(structured));
    });

    it("returns Left when chain.stream throws", async () => {
      const chain = {
        stream: vi.fn().mockRejectedValue(new Error("Connection failed")),
        invoke: vi.fn(),
      };
      const ctx = createMockContext();

      const result = await runAgent(
        [] as Messages,
        chain as Agent,
      )(ctx as LoggerContext)();

      expect(result._tag).toBe("Left");
    });
  });

  describe("invoke mode", () => {
    it("invokes chain and returns stringified messages", async () => {
      const messages = [{ role: "assistant", content: "response" }];
      const chain = {
        stream: vi.fn(),
        invoke: vi.fn().mockResolvedValue({ messages }),
      };
      const ctx = createMockContext();

      const result = await throwTE(
        runAgent(
          [] as Messages,
          chain as Agent,
          "invoke",
        )(ctx as LoggerContext),
      );

      expect(chain.invoke).toHaveBeenCalledWith({ messages: [] });
      expect(result).toBe(JSON.stringify(messages));
    });

    it("returns Left when chain.invoke throws", async () => {
      const chain = {
        stream: vi.fn(),
        invoke: vi.fn().mockRejectedValue(new Error("Invoke failed")),
      };
      const ctx = createMockContext();

      const result = await runAgent(
        [] as Messages,
        chain as Agent,
        "invoke",
      )(ctx as LoggerContext)();

      expect(result._tag).toBe("Left");
    });
  });

  it("logs the mode at the start", async () => {
    const chain = {
      stream: vi.fn().mockResolvedValue(makeAsyncIterable([])),
      invoke: vi.fn(),
    };
    const ctx = createMockContext();

    await throwTE(
      runAgent([] as Messages, chain as Agent, "stream")(ctx as LoggerContext),
    );

    expect(ctx.logger.debug.log).toHaveBeenCalledWith(
      "Running sequence in mode %s",
      "stream",
    );
  });

  it("logs the output when done", async () => {
    const chain = {
      stream: vi.fn().mockResolvedValue(makeAsyncIterable([])),
      invoke: vi.fn(),
    };
    const ctx = createMockContext();

    await throwTE(
      runAgent([] as Messages, chain as Agent)(ctx as LoggerContext),
    );

    expect(ctx.logger.debug.log).toHaveBeenCalledWith("Output %s", "");
  });
});

describe("processChunk", () => {
  it("crashes for unrecognized chunk shape (no content property)", () => {
    expect(() => processChunk({}, "")).toThrow();
  });

  it("replaces output with structured response", () => {
    const structured = { title: "Test", date: "2024-01-01" };
    const result = processChunk(
      { generate_structured_response: { structuredResponse: structured } },
      "previous",
    );
    expect(result).toBe(JSON.stringify(structured));
  });

  it("appends agent chunk to current output", () => {
    const result = processChunk({ agent: "hello" }, "prefix");
    expect(result).toBe('prefix"hello"');
  });

  it("appends multiple agent chunks in sequence", () => {
    let output = "";
    output = processChunk({ agent: "first" }, output);
    output = processChunk({ agent: "second" }, output);
    expect(output).toBe('"first""second"');
  });

  it("structured response overrides accumulated agent output", () => {
    let output = "";
    output = processChunk({ agent: "preliminary" }, output);
    output = processChunk(
      {
        generate_structured_response: {
          structuredResponse: { final: "answer" },
        },
      },
      output,
    );
    expect(output).toBe(JSON.stringify({ final: "answer" }));
  });

  it("crashes when content is undefined (no optional chaining)", () => {
    expect(() => processChunk({ content: undefined }, "")).toThrow();
  });

  it("crashes when chunk has no content property", () => {
    expect(() => processChunk({ foo: "bar" }, "")).toThrow();
  });

  it("appends content.messages as fallback", () => {
    const result = processChunk(
      { content: { messages: [{ role: "user", content: "hi" }] } },
      "",
    );
    expect(result).toBe(JSON.stringify([{ role: "user", content: "hi" }]));
  });
});
