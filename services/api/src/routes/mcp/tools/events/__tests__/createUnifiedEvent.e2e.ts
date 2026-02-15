import { MediaEntity } from "@liexp/backend/lib/entities/Media.entity.js";
import { toMediaEntity } from "@liexp/backend/lib/test/utils/entities/index.js";
import { throwTE, throwRTE } from "@liexp/shared/lib/utils/fp.utils.js";
import { MediaArb } from "@liexp/test/lib/arbitrary/Media.arbitrary.js";
import fc from "fast-check";
import { pipe } from "fp-ts/lib/function.js";
import { beforeAll, describe, expect, test } from "vitest";
import { type AppTest, GetAppTest } from "../../../../../../test/AppTest.js";
import { createUnifiedEventToolTask } from "../createUnifiedEvent.tool.js";

describe("Unified Event Creation Tool (MCP)", () => {
  let Test: AppTest;
  let testMedia1: MediaEntity;
  let testMedia2: MediaEntity;

  beforeAll(async () => {
    Test = await GetAppTest();

    const mediaSample = fc.sample(MediaArb, 2);
    testMedia1 = toMediaEntity({
      ...mediaSample[0],
      type: "image/jpeg",
      links: [],
      events: [],
      keywords: [],
      areas: [],
    });

    testMedia2 = toMediaEntity({
      ...mediaSample[1],
      type: "image/jpeg",
      links: [],
      events: [],
      keywords: [],
      areas: [],
    });

    await throwTE(Test.ctx.db.save(MediaEntity, [testMedia1, testMedia2]));
  });

  test("Should create an Uncategorized event via unified tool", async () => {
    const result = await pipe(
      createUnifiedEventToolTask({
        date: "2024-01-15",
        draft: false,
        excerpt: null,
        body: null,
        media: [],
        links: [],
        keywords: [],
        type: "Uncategorized",
        payload: {
          type: "Uncategorized",
          title: "Test Uncategorized Event",
          location: undefined,
          endDate: undefined,
          actors: [],
          groups: [],
          groupsMembers: [],
        },
      }),
      throwRTE(Test.ctx),
    );

    expect(result).toHaveProperty("content");
    expect(Array.isArray(result.content)).toBe(true);
    expect(result.content).toHaveLength(1);
    expect(result.content[0]).toEqual(
      expect.objectContaining({
        type: "text",
        text: expect.any(String),
        uri: expect.any(String),
      }),
    );
  });

  test("Should create a Book event via unified tool", async () => {
    const result = await pipe(
      createUnifiedEventToolTask({
        date: "2024-02-10",
        draft: false,
        excerpt: null,
        body: null,
        media: [],
        links: [],
        keywords: [],
        type: "Book",
        payload: {
          type: "Book",
          title: "Test Book",
          pdfMediaId: testMedia1.id,
          audioMediaId: undefined,
          authors: [],
          publisher: undefined,
        },
      }),
      throwRTE(Test.ctx),
    );

    expect(result).toHaveProperty("content");
    expect(Array.isArray(result.content)).toBe(true);
    expect(result.content[0].type).toBe("text");
    expect(result.content[0].uri).toBeDefined();
  });

  test("Should create a Quote event via unified tool", async () => {
    const result = await pipe(
      createUnifiedEventToolTask({
        date: "2024-03-15",
        draft: false,
        excerpt: null,
        body: null,
        media: [],
        links: [],
        keywords: [],
        type: "Quote",
        payload: {
          type: "Quote",
          details: "This is a test quote",
          subject: undefined,
        },
      }),
      throwRTE(Test.ctx),
    );

    expect(result).toHaveProperty("content");
    expect(result.content[0].type).toBe("text");
  });

  test("Should create a Death event via unified tool", async () => {
    const result = await pipe(
      createUnifiedEventToolTask({
        date: "2024-04-20",
        draft: false,
        excerpt: null,
        body: null,
        media: [],
        links: [],
        keywords: [],
        type: "Death",
        payload: {
          type: "Death",
          victim: testMedia1.id, // Using a placeholder UUID
          location: undefined,
        },
      }),
      throwRTE(Test.ctx),
    );

    expect(result).toHaveProperty("content");
    expect(result.content[0].type).toBe("text");
  });

  test("Should create a Patent event via unified tool", async () => {
    const result = await pipe(
      createUnifiedEventToolTask({
        date: "2024-05-05",
        draft: false,
        excerpt: null,
        body: null,
        media: [],
        links: [],
        keywords: [],
        type: "Patent",
        payload: {
          type: "Patent",
          idNumber: "US12345",
          title: "Test Patent",
          inventors: [],
          assignee: undefined,
        },
      }),
      throwRTE(Test.ctx),
    );

    expect(result).toHaveProperty("content");
    expect(result.content[0].type).toBe("text");
  });

  test("Should create a ScientificStudy event via unified tool", async () => {
    const result = await pipe(
      createUnifiedEventToolTask({
        date: "2024-06-10",
        draft: false,
        excerpt: null,
        body: null,
        media: [],
        links: [],
        keywords: [],
        type: "ScientificStudy",
        payload: {
          type: "ScientificStudy",
          title: "Test Study",
          authors: [],
          publisher: undefined,
          url: testMedia1.id, // Using UUID instead of string URL
          image: undefined,
        },
      }),
      throwRTE(Test.ctx),
    );

    expect(result).toHaveProperty("content");
    expect(result.content[0].type).toBe("text");
  });

  test("Should create a Documentary event via unified tool", async () => {
    const result = await pipe(
      createUnifiedEventToolTask({
        date: "2024-07-15",
        draft: false,
        excerpt: null,
        body: null,
        media: [testMedia1.id],
        links: [],
        keywords: [],
        type: "Documentary",
        payload: {
          type: "Documentary",
          title: "Test Documentary",
          media: testMedia1.id,
          website: undefined,
          authors: {
            actors: [],
            groups: [],
          },
          subjects: {
            actors: [],
            groups: [],
          },
        },
      }),
      throwRTE(Test.ctx),
    );

    expect(result).toHaveProperty("content");
    expect(result.content[0].type).toBe("text");
  });

  test("Should create a Transaction event via unified tool", async () => {
    const result = await pipe(
      createUnifiedEventToolTask({
        date: "2024-08-20",
        draft: false,
        excerpt: null,
        body: null,
        media: [],
        links: [],
        keywords: [],
        type: "Transaction",
        payload: {
          type: "Transaction",
          title: "Test Transaction",
          amount: 1000,
          currency: "USD",
          from: { type: "Actor" as const, id: testMedia1.id },
          to: { type: "Actor" as const, id: testMedia2.id },
        },
      }),
      throwRTE(Test.ctx),
    );

    expect(result).toHaveProperty("content");
    expect(result.content[0].type).toBe("text");
  });

  test("Should create event with media", async () => {
    const result = await pipe(
      createUnifiedEventToolTask({
        date: "2024-09-25",
        draft: false,
        excerpt: "Test with media",
        body: "Body content",
        media: [testMedia1.id, testMedia2.id],
        links: [],
        keywords: [],
        type: "Uncategorized",
        payload: {
          type: "Uncategorized",
          title: "Event with Media",
          location: undefined,
          endDate: undefined,
          actors: [],
          groups: [],
          groupsMembers: [],
        },
      }),
      throwRTE(Test.ctx),
    );

    expect(result).toHaveProperty("content");
    expect(result.content[0].uri).toBeDefined();
  });

  test("Should create draft event", async () => {
    const result = await pipe(
      createUnifiedEventToolTask({
        date: "2024-10-30",
        draft: true,
        excerpt: null,
        body: null,
        media: [],
        links: [],
        keywords: [],
        type: "Uncategorized",
        payload: {
          type: "Uncategorized",
          title: "Draft Event",
          location: undefined,
          endDate: undefined,
          actors: [],
          groups: [],
          groupsMembers: [],
        },
      }),
      throwRTE(Test.ctx),
    );

    expect(result).toHaveProperty("content");
    expect(result.content[0].type).toBe("text");
  });
});
