import { pipe } from "@liexp/core/lib/fp/index.js";
import { throwTE } from "@liexp/shared/lib/utils/fp.utils.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { describe, expect, it, vi } from "vitest";
import { createEventFromDocuments } from "./createEventFromDocuments.flow.js";

const createMockContext = (chatResult?: any) => {
  const chatCreate = vi.fn().mockImplementation(() =>
    TE.right(
      chatResult ?? {
        data: {
          message: {
            content: JSON.stringify({
              title: "Test Event",
              date: "2024-01-01",
            }),
          },
        },
      },
    ),
  );

  return {
    logger: {
      info: { log: vi.fn() },
      debug: { log: vi.fn() },
      warn: { log: vi.fn() },
      error: { log: vi.fn() },
      extend: vi.fn().mockReturnThis(),
    },
    agent: {
      Chat: {
        Create: chatCreate,
      },
    },
  };
};

const mockPromptFn = vi.fn().mockReturnValue("rendered prompt template");

describe("createEventFromDocuments", () => {
  it("calls Chat.Create with the rendered prompt and question", async () => {
    const ctx = createMockContext();

    await pipe(
      createEventFromDocuments(
        [],
        "Death",
        mockPromptFn,
        {},
        "What is this event?",
      )(ctx as any),
      throwTE,
    );

    expect(ctx.agent.Chat.Create).toHaveBeenCalledWith(
      expect.objectContaining({
        Body: expect.objectContaining({
          message: expect.stringContaining("What is this event?"),
        }),
      }),
    );
  });

  it("includes the rendered prompt in the message", async () => {
    const promptFn = vi.fn().mockReturnValue("my custom prompt");
    const ctx = createMockContext();

    await pipe(
      createEventFromDocuments(
        [],
        "Quote",
        promptFn,
        {},
        "question",
      )(ctx as any),
      throwTE,
    );

    const call = ctx.agent.Chat.Create.mock.calls[0][0];
    expect(call.Body.message).toContain("my custom prompt");
  });

  it("uses the event type when building the prompt", async () => {
    const promptFn = vi.fn().mockReturnValue("prompt");
    const ctx = createMockContext();

    await pipe(
      createEventFromDocuments(
        [],
        "ScientificStudy",
        promptFn,
        {},
        "q",
      )(ctx as any),
      throwTE,
    );

    expect(promptFn).toHaveBeenCalledWith(
      expect.objectContaining({
        vars: expect.objectContaining({ type: "ScientificStudy" }),
      }),
    );
  });

  it("returns Left when Chat.Create fails", async () => {
    const ctx = {
      ...createMockContext(),
      agent: {
        Chat: {
          Create: vi.fn().mockImplementation(() =>
            TE.left({
              name: "APIError",
              message: "Unauthorized",
              status: 401,
            }),
          ),
        },
      },
    };

    const result = await createEventFromDocuments(
      [],
      "Book",
      mockPromptFn,
      {},
      "q",
    )(ctx as any)();

    expect(result._tag).toBe("Left");
  });
});
