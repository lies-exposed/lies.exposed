import { pipe } from "@liexp/core/lib/fp/index.js";
import { throwTE } from "@liexp/shared/lib/utils/fp.utils.js";
import { describe, expect, it, vi } from "vitest";
import { getCreateEventPromptPartial } from "./createEventFromText.flow.js";

const createMockContext = () => ({
  logger: {
    info: { log: vi.fn() },
    debug: { log: vi.fn() },
    warn: { log: vi.fn() },
    error: { log: vi.fn() },
    extend: vi.fn().mockReturnThis(),
  },
});

describe("getCreateEventPromptPartial", () => {
  it("calls the prompt template with the correct variables", async () => {
    const promptTemplate = vi.fn().mockReturnValue("rendered template");
    const ctx = createMockContext();

    await pipe(
      getCreateEventPromptPartial(promptTemplate, "Death")(ctx as any),
      throwTE,
    );

    expect(promptTemplate).toHaveBeenCalledWith({
      vars: {
        type: "Death",
        jsonSchema: "{jsonSchema}",
        question: "{question}",
        context: "{context}",
      },
    });
  });

  it("returns a HumanMessage with the rendered template", async () => {
    const promptTemplate = vi.fn().mockReturnValue("my event prompt");
    const ctx = createMockContext();

    const result = await pipe(
      getCreateEventPromptPartial(promptTemplate, "Book")(ctx as any),
      throwTE,
    );

    expect(result.content).toBe("my event prompt");
  });

  it("works with all event types", async () => {
    const eventTypes = [
      "Book",
      "Death",
      "Documentary",
      "ScientificStudy",
      "Patent",
      "Transaction",
      "Quote",
      "Uncategorized",
    ] as const;

    for (const type of eventTypes) {
      const promptTemplate = vi.fn().mockReturnValue(`prompt for ${type}`);
      const ctx = createMockContext();

      const result = await pipe(
        getCreateEventPromptPartial(promptTemplate, type)(ctx as any),
        throwTE,
      );

      expect(result.content, `type=${type}`).toBe(`prompt for ${type}`);
      expect(promptTemplate).toHaveBeenCalledWith(
        expect.objectContaining({ vars: expect.objectContaining({ type }) }),
      );
    }
  });

  it("logs the template with event type", async () => {
    const promptTemplate = vi.fn().mockReturnValue("the template");
    const ctx = createMockContext();

    await pipe(
      getCreateEventPromptPartial(promptTemplate, "Quote")(ctx as any),
      throwTE,
    );

    expect(ctx.logger.info.log).toHaveBeenCalledWith(
      expect.any(String),
      "Quote",
      "the template",
    );
  });
});
