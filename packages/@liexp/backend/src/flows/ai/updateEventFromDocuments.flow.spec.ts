import { pipe } from "@liexp/core/lib/fp/index.js";
import { throwTE } from "@liexp/shared/lib/utils/fp.utils.js";
import { describe, expect, it, vi } from "vitest";
import { updateEventFromDocuments } from "./updateEventFromDocuments.flow.js";

const createMockContext = (chatResponse?: any) => ({
  logger: {
    info: { log: vi.fn() },
    debug: { log: vi.fn() },
    warn: { log: vi.fn() },
    error: { log: vi.fn() },
    extend: vi.fn().mockReturnThis(),
  },
  langchain: {
    chat: {
      invoke: vi
        .fn()
        .mockResolvedValue(
          chatResponse ?? { content: JSON.stringify({ title: "Test Event" }) },
        ),
    },
  },
});

const mockPromptFn = vi.fn().mockReturnValue("rendered prompt");

describe("updateEventFromDocuments", () => {
  it("invokes the chat model with system and human messages", async () => {
    const ctx = createMockContext({
      content: JSON.stringify({ date: "2024-01-01" }),
    });

    await pipe(
      updateEventFromDocuments(
        "Death",
        mockPromptFn,
        "What happened?",
      )(ctx as any),
      throwTE,
    );

    expect(ctx.langchain.chat.invoke).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ content: expect.any(String) }),
        expect.objectContaining({ content: "What happened?" }),
      ]),
    );
  });

  it("parses string response content as JSON", async () => {
    const eventProps = {
      title: "Test Death",
      date: "2024-01-01",
      excerpt: "An excerpt",
    };
    const ctx = createMockContext({ content: JSON.stringify(eventProps) });

    const result = await pipe(
      updateEventFromDocuments("Death", mockPromptFn, "question")(ctx as any),
      throwTE,
    );

    expect(result).toEqual(eventProps);
  });

  it("stringifies non-string response content before parsing", async () => {
    const eventProps = { title: "Book Event" };
    const ctx = createMockContext({ content: eventProps });

    const result = await pipe(
      updateEventFromDocuments("Book", mockPromptFn, "question")(ctx as any),
      throwTE,
    );

    expect(result).toEqual(eventProps);
  });

  it("builds prompt from the prompt template with event type", async () => {
    const promptFn = vi.fn().mockReturnValue("prompt for Quote");
    const ctx = createMockContext({ content: "{}" });

    await pipe(
      updateEventFromDocuments("Quote", promptFn, "question")(ctx as any),
      throwTE,
    );

    expect(promptFn).toHaveBeenCalledWith(
      expect.objectContaining({
        vars: expect.objectContaining({ type: "Quote" }),
      }),
    );
  });

  it("returns Left when chat invocation throws", async () => {
    const ctx = createMockContext();
    ctx.langchain.chat.invoke = vi
      .fn()
      .mockRejectedValue(new Error("LLM unavailable"));

    const result = await updateEventFromDocuments(
      "ScientificStudy",
      mockPromptFn,
      "question",
    )(ctx as any)();

    expect(result._tag).toBe("Left");
  });

  it("returns Left when response content is invalid JSON", async () => {
    const ctx = createMockContext({ content: "not valid json {{" });

    const result = await updateEventFromDocuments(
      "Patent",
      mockPromptFn,
      "question",
    )(ctx as any)();

    expect(result._tag).toBe("Left");
  });

  it("logs the messages and response", async () => {
    const ctx = createMockContext({ content: "{}" });

    await pipe(
      updateEventFromDocuments(
        "Transaction",
        mockPromptFn,
        "question",
      )(ctx as any),
      throwTE,
    );

    expect(ctx.logger.debug.log).toHaveBeenCalledWith(
      "Invoking chat model with messages %O",
      expect.any(Array),
    );
    expect(ctx.logger.debug.log).toHaveBeenCalledWith(
      "Chat model response %O",
      expect.any(Object),
    );
  });
});
