import { EventV2Entity } from "@liexp/backend/lib/entities/Event.v2.entity.js";
import { MediaEntity } from "@liexp/backend/lib/entities/Media.entity.js";
import { toMediaEntity } from "@liexp/backend/lib/test/utils/entities/index.js";
import {
  BOOK,
  DOCUMENTARY,
  type EventType,
  QUOTE,
  UNCATEGORIZED,
} from "@liexp/shared/lib/io/http/Events/EventType.js";
import { type Event } from "@liexp/shared/lib/io/http/Events/index.js";
import { throwRTE, throwTE } from "@liexp/shared/lib/utils/fp.utils.js";
import { MediaArb } from "@liexp/test/lib/arbitrary/Media.arbitrary.js";
import {
  EventTypeArb,
  getEventArbitrary,
} from "@liexp/test/lib/arbitrary/events/index.arbitrary.js";
import fc from "fast-check";
import { pipe } from "fp-ts/lib/function.js";
import { beforeAll, describe, expect, test } from "vitest";
import { type AppTest, GetAppTest } from "../../../../../../test/AppTest.js";
import {
  type EditEventInputSchema,
  editEventToolTask,
} from "../editEvent.tool.js";

describe("MCP EDIT_EVENT Tool", () => {
  let Test: AppTest;
  const createdEvents = fc.sample(EventTypeArb.chain(getEventArbitrary), 2);

  beforeAll(async () => {
    Test = await GetAppTest();
    // Create one event of each type
  });

  interface EditEventToolCall<E extends EventType = EventType> {
    type: E;
    arrange?: (type: E) => Promise<{ event: Event }>;
  }

  const calls: EditEventToolCall[] = [
    {
      type: BOOK.literals[0],
      arrange: async (type) => {
        const pdf = fc.sample(MediaArb, 1).map(toMediaEntity);

        await throwTE(Test.ctx.db.save(MediaEntity, pdf));
        const event = fc
          .sample(getEventArbitrary(type as BOOK), 1)
          .map((e) => ({
            ...e,
            media: [],
            links: [],
          }))[0];

        return Promise.resolve({ event });
      },
    },
    { type: DOCUMENTARY.literals[0] },
    { type: QUOTE.literals[0] },

    {
      type: UNCATEGORIZED.literals[0],
      arrange: (type) => {
        const event = fc.sample(getEventArbitrary(type), 1)[0];

        return Promise.resolve({ event });
      },
    },
  ];

  test.each(calls)(`Should edit $type event`, async (call) => {
    const { event } = await (call.arrange
      ? call.arrange(call.type)
      : Promise.resolve({
          event: fc.sample(getEventArbitrary(call.type), 1)[0],
        }));

    const eventData = {
      ...event,
      links: [],
      keywords: [],
      media: [],
      socialPosts: [],
    };
    await throwTE(Test.ctx.db.save(EventV2Entity, [eventData]));
    // Prepare edit payload (simulate a title change)
    const editPayload = {
      id: eventData.id,
      date: eventData.date.toISOString(),
      draft: eventData.draft ?? false,
      excerpt: eventData.excerpt ?? null,
      body: eventData.body ?? null,
      media: eventData.media ?? [],
      links: eventData.links ?? [],
      keywords: eventData.keywords ?? [],
      payload: {
        type: eventData.type,
        payload: { ...eventData.payload, title: `Edited ${eventData.type}` },
      },
    } as EditEventInputSchema;

    const result = await pipe(
      editEventToolTask(editPayload),
      throwRTE(Test.ctx),
    );

    expect(result).toHaveProperty("content");
    expect(Array.isArray(result.content)).toBe(true);
    expect(result.content).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: "text",
          text: expect.any(String),
        }),
      ]),
    );
  });

  test("Should reject requests without token", async () => {
    const event = createdEvents[0];
    const editPayload = {
      id: event.id,
      date: event.date,
      draft: event.draft ?? false,
      excerpt: event.excerpt ?? null,
      body: event.body ?? null,
      media: event.media ?? [],
      links: event.links ?? [],
      keywords: event.keywords ?? [],
      payload: {
        type: event.type,
      },
    };
    const toolCallRequest = {
      jsonrpc: "2.0",
      id: 3,
      method: "tools/call",
      params: {
        name: "editEvent",
        arguments: editPayload,
      },
    };
    const response = await Test.req
      .post("/mcp")
      .set("Content-Type", "application/json")
      .send(toolCallRequest);
    expect(response.status).toBe(401);
  });

  test("Should reject requests with invalid token", async () => {
    const event = fc.sample(getEventArbitrary(BOOK.literals[0]), 1)[0];
    const editPayload = {
      id: event.id,
      date: event.date,
      draft: event.draft ?? false,
      excerpt: event.excerpt ?? null,
      body: event.body ?? null,
      media: event.media ?? [],
      links: event.links ?? [],
      keywords: event.keywords ?? [],
      payload: {
        type: event.type,
        payload: { ...event.payload, title: `Edited ${event.payload.title}` },
      },
    };
    const toolCallRequest = {
      jsonrpc: "2.0",
      id: 4,
      method: "tools/call",
      params: {
        name: "editEvent",
        arguments: editPayload,
      },
    };
    const response = await Test.req
      .post("/mcp")
      .set("Authorization", "Bearer invalid-token-12345")
      .set("Content-Type", "application/json")
      .send(toolCallRequest);
    expect(response.status).toBe(401);
  });
});
