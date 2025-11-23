import { MediaEntity } from "@liexp/backend/lib/entities/Media.entity.js";
import { toMediaEntity } from "@liexp/backend/lib/test/utils/entities/index.js";
import { type UUID } from "@liexp/shared/lib/io/http/Common/UUID.js";
import { type MP4Type } from "@liexp/shared/lib/io/http/Media/MediaType.js";
import { throwRTE, throwTE } from "@liexp/shared/lib/utils/fp.utils.js";
import { MediaArb } from "@liexp/test/lib/arbitrary/Media.arbitrary.js";
import { BookEventArb } from "@liexp/test/lib/arbitrary/events/BookEvent.arbitrary.js";
import fc from "fast-check";
import { pipe } from "fp-ts/lib/function.js";
import { beforeAll, describe, expect, test } from "vitest";
import { type AppTest, GetAppTest } from "../../../../../../test/AppTest.js";
import { createBookEventToolTask } from "../createBookEvent.tool.js";

describe("MCP CREATE_BOOK_EVENT Tool", () => {
  let Test: AppTest;
  let testPdfMedia: MediaEntity;
  let testAudioMedia: MediaEntity;

  const createBookEventData = (
    overrides: {
      audioMediaId?: UUID | null;
    } = {},
  ) => {
    const bookEvent = fc.sample(BookEventArb, 1)[0];
    return {
      title: bookEvent.payload.title,
      date: bookEvent.date.toISOString().split("T")[0],
      draft: bookEvent.draft,
      excerpt: null,
      body: null,
      media: [],
      links: [],
      keywords: [],
      pdfMediaId: testPdfMedia.id,
      audioMediaId: overrides.audioMediaId ?? null,
      authors: [],
      publisher: null,
    };
  };

  beforeAll(async () => {
    Test = await GetAppTest();

    // Create test media
    const mediaSample = fc.sample(MediaArb, 2);
    testPdfMedia = toMediaEntity({
      ...mediaSample[0],
      type: "image/jpeg",
      links: [],
      events: [],
      keywords: [],
      areas: [],
    });

    testAudioMedia = toMediaEntity({
      ...mediaSample[1],
      type: "video/mp4" as MP4Type,
      links: [],
      events: [],
      keywords: [],
      areas: [],
    });

    await throwTE(
      Test.ctx.db.save(MediaEntity, [testPdfMedia, testAudioMedia]),
    );
  });

  test("Should create book event with PDF only", async () => {
    const result = await pipe(
      createBookEventToolTask(createBookEventData()),
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

  test("Should create book event with PDF and audio", async () => {
    const result = await pipe(
      createBookEventToolTask(
        createBookEventData({ audioMediaId: testAudioMedia.id }),
      ),
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
    const toolCallRequest = {
      jsonrpc: "2.0",
      id: 3,
      method: "tools/call",
      params: {
        name: "createBookEvent",
        arguments: createBookEventData(),
      },
    };

    const response = await Test.req
      .post("/mcp")
      .set("Content-Type", "application/json")
      .send(toolCallRequest);

    expect(response.status).toBe(401);
  });

  test("Should reject requests with invalid token", async () => {
    const toolCallRequest = {
      jsonrpc: "2.0",
      id: 4,
      method: "tools/call",
      params: {
        name: "createBookEvent",
        arguments: createBookEventData(),
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
