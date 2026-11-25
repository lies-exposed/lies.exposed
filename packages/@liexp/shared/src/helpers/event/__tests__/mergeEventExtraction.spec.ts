import { uuid } from "@liexp/io/lib/http/Common/UUID.js";
import {
  type Documentary,
  type DocumentaryPayload,
} from "@liexp/io/lib/http/Events/Documentary.js";
import { EVENT_TYPES } from "@liexp/io/lib/http/Events/EventType.js";
import {
  type Transaction,
  type TransactionPayload,
} from "@liexp/io/lib/http/Events/Transaction.js";
import {
  type Uncategorized,
  type UncategorizedV2Payload,
} from "@liexp/io/lib/http/Events/Uncategorized.js";
import { Event } from "@liexp/io/lib/http/Events/index.js";
import { type UpdateEventAgentOutput } from "@liexp/io/lib/http/Queue/event/UpdateEventQueue.js";
import { Schema } from "effect";
import { describe, expect, test } from "vitest";
import { toInitialValue } from "../../../providers/blocknote/utils.js";
import { mergeEventExtraction } from "../mergeEventExtraction.js";

const createOutput = (
  overrides?: Partial<UpdateEventAgentOutput>,
): UpdateEventAgentOutput => ({
  title: null,
  date: null,
  excerpt: null,
  location: null,
  endDate: null,
  quote: null,
  details: null,
  total: null,
  currency: null,
  actors: [],
  groups: [],
  keywords: [],
  missing: { actors: [], groups: [], keywords: [] },
  changes: [],
  ...overrides,
});

const createUncategorized = (
  overrides?: Partial<Uncategorized>,
): Uncategorized => ({
  id: uuid(),
  type: EVENT_TYPES.UNCATEGORIZED,
  draft: false,
  date: new Date("2024-01-01T00:00:00.000Z"),
  excerpt: toInitialValue("Original excerpt"),
  body: toInitialValue("Original body"),
  media: [],
  links: [],
  keywords: [],
  socialPosts: [],
  createdAt: new Date("2024-01-01T00:00:00.000Z"),
  updatedAt: new Date("2024-01-01T00:00:00.000Z"),
  deletedAt: undefined,
  payload: {
    title: "Original title",
    location: undefined,
    endDate: undefined,
    actors: [],
    groups: [],
    groupsMembers: [],
  },
  ...overrides,
});

const createTransaction = (overrides?: Partial<Transaction>): Transaction => ({
  id: uuid(),
  type: EVENT_TYPES.TRANSACTION,
  draft: false,
  date: new Date("2024-01-01T00:00:00.000Z"),
  excerpt: toInitialValue("Original excerpt"),
  body: toInitialValue("Original body"),
  media: [],
  links: [],
  keywords: [],
  socialPosts: [],
  createdAt: new Date("2024-01-01T00:00:00.000Z"),
  updatedAt: new Date("2024-01-01T00:00:00.000Z"),
  deletedAt: undefined,
  payload: {
    title: "Original title",
    total: 100,
    currency: "EUR",
    from: { type: "Actor", id: uuid() },
    to: { type: "Actor", id: uuid() },
  },
  ...overrides,
});

const createDocumentary = (overrides?: Partial<Documentary>): Documentary => ({
  id: uuid(),
  type: EVENT_TYPES.DOCUMENTARY,
  draft: false,
  date: new Date("2024-01-01T00:00:00.000Z"),
  excerpt: toInitialValue("Original excerpt"),
  body: toInitialValue("Original body"),
  media: [],
  links: [],
  keywords: [],
  socialPosts: [],
  createdAt: new Date("2024-01-01T00:00:00.000Z"),
  updatedAt: new Date("2024-01-01T00:00:00.000Z"),
  deletedAt: undefined,
  payload: {
    title: "Original title",
    media: uuid(),
    website: undefined,
    authors: { actors: [], groups: [] },
    subjects: { actors: [], groups: [] },
  },
  ...overrides,
});

describe("mergeEventExtraction", () => {
  test("Should ignore null scalars and leave the event unchanged", () => {
    const event = createUncategorized();
    const merged = mergeEventExtraction(event, createOutput());

    expect((merged.payload as UncategorizedV2Payload).title).toBe(
      "Original title",
    );
    expect(merged.date).toEqual(event.date);
    expect(merged.excerpt).toEqual(event.excerpt);
    expect(merged.report.changes).toEqual([]);
  });

  test("Should overwrite scalars that belong to the event payload", () => {
    const event = createUncategorized();
    const merged = mergeEventExtraction(
      event,
      createOutput({
        title: "New title",
        date: new Date("2024-06-06T00:00:00.000Z"),
        excerpt: "New excerpt",
        endDate: new Date("2024-06-30T00:00:00.000Z"),
      }),
    );

    expect((merged.payload as UncategorizedV2Payload).title).toBe("New title");
    expect(merged.date.toISOString()).toBe("2024-06-06T00:00:00.000Z");
    expect(
      (merged.payload as UncategorizedV2Payload).endDate?.toISOString(),
    ).toBe("2024-06-30T00:00:00.000Z");
    expect(Array.isArray(merged.excerpt)).toBe(true);

    const changedFields = merged.report.changes.map((c) => c.field);
    expect(changedFields).toContain("title");
    expect(changedFields).toContain("date");
    expect(changedFields).toContain("excerpt");
    expect(changedFields).toContain("endDate");
  });

  test("Should not write scalar keys that are absent from the event payload", () => {
    const event = createUncategorized();
    const merged = mergeEventExtraction(
      event,
      createOutput({ quote: "nope", total: 5, currency: "USD" }),
    );

    const payload = merged.payload as Record<string, unknown>;
    expect(payload.quote).toBe(undefined);
    expect(payload.total).toBe(undefined);
    expect(
      (merged.payload as Record<string, unknown>).currency,
    ).toBeUndefined();
    expect(merged.report.changes).toEqual([]);
  });

  test("Should merge quote and transaction scalars on their own types", () => {
    const transaction = createTransaction();
    const mergedTransaction = mergeEventExtraction(
      transaction,
      createOutput({ total: 42, currency: "USD", title: "New title" }),
    );
    expect((mergedTransaction.payload as TransactionPayload).total).toBe(42);
    expect((mergedTransaction.payload as TransactionPayload).currency).toBe(
      "USD",
    );
    expect((mergedTransaction.payload as TransactionPayload).title).toBe(
      "New title",
    );
    expect(
      (
        mergeEventExtraction(transaction, createOutput({ quote: "x" }))
          .payload as Record<string, unknown>
      ).quote,
    ).toBeUndefined();
  });

  test("Should add relations without removing existing ones", () => {
    const actor = uuid();
    const group = uuid();
    const keyword = uuid();
    const event = createUncategorized({
      keywords: [keyword],
      payload: {
        title: "Original title",
        location: undefined,
        endDate: undefined,
        actors: [uuid()],
        groups: [group],
        groupsMembers: [],
      },
    });

    const sourcePayload = event.payload;
    const existingActors = sourcePayload.actors;
    const merged = mergeEventExtraction(
      event,
      createOutput({
        actors: [...existingActors, actor],
        groups: [group, uuid()],
        keywords: [keyword, uuid()],
      }),
    );

    const mergedPayload = merged.payload as UncategorizedV2Payload;
    expect(new Set(mergedPayload.actors)).toEqual(
      new Set([...existingActors, actor]),
    );
    expect(mergedPayload.groups).toHaveLength(2);
    expect(merged.keywords).toHaveLength(2);
  });

  test("Should leave role fields of non-Uncategorized types untouched", () => {
    const documentary = createDocumentary({
      payload: {
        title: "Original title",
        media: uuid(),
        website: undefined,
        authors: { actors: [uuid()], groups: [] },
        subjects: { actors: [], groups: [] },
      },
    });
    const mergedDocumentary = mergeEventExtraction(
      documentary,
      createOutput({ actors: [uuid()], groups: [uuid()] }),
    );

    const sourceDoc = documentary.payload;
    const mergedDoc = mergedDocumentary.payload as DocumentaryPayload;
    expect(mergedDoc.authors).toEqual(sourceDoc.authors);
    expect(mergedDoc.subjects).toEqual(sourceDoc.subjects);

    const transaction = createTransaction();
    const mergedTransaction = mergeEventExtraction(
      transaction,
      createOutput({ actors: [uuid()], groups: [uuid()] }),
    );
    const sourceTx = transaction.payload;
    const mergedTx = mergedTransaction.payload as TransactionPayload;
    expect(mergedTx.from).toEqual(sourceTx.from);
    expect(mergedTx.to).toEqual(sourceTx.to);
  });

  test("Should keep keywords additive on every event type", () => {
    const keyword = uuid();
    const documentary = createDocumentary({ keywords: [keyword] });
    const merged = mergeEventExtraction(
      documentary,
      createOutput({ keywords: [keyword, uuid()] }),
    );
    expect(merged.keywords).toHaveLength(2);
  });

  test("Should never change draft, links, media, id and type", () => {
    const event = createUncategorized({
      draft: true,
      links: [uuid()],
      media: [uuid()],
    });
    const merged = mergeEventExtraction(
      event,
      createOutput({ title: "New title", excerpt: "New excerpt" }),
    );

    expect(merged.id).toBe(event.id);
    expect(merged.type).toBe(event.type);
    expect(merged.draft).toBe(true);
    expect(merged.links).toEqual(event.links);
    expect(merged.media).toEqual(event.media);
  });

  test("Should report missing names from the output", () => {
    const event = createUncategorized();
    const merged = mergeEventExtraction(
      event,
      createOutput({
        missing: { actors: ["Jane Doe"], groups: [], keywords: ["sanctions"] },
      }),
    );

    expect(merged.report.missing.actors).toEqual(["Jane Doe"]);
    expect(merged.report.missing.keywords).toEqual(["sanctions"]);
  });

  test("Should not mutate the input event", () => {
    const event = createUncategorized();
    mergeEventExtraction(event, createOutput({ title: "New title" }));
    expect(event.payload.title).toBe("Original title");
  });

  test("Should decode the merged result as Event", () => {
    const results: unknown[] = [
      mergeEventExtraction(
        createUncategorized(),
        createOutput({
          title: "New title",
          date: new Date("2024-06-06"),
          excerpt: "New excerpt",
          endDate: new Date("2024-06-30"),
          actors: [uuid()],
          groups: [uuid()],
          keywords: [uuid()],
        }),
      ),
      mergeEventExtraction(
        createTransaction(),
        createOutput({ title: "New title", total: 7, currency: "USD" }),
      ),
      mergeEventExtraction(
        createDocumentary(),
        createOutput({ title: "New title", keywords: [uuid()] }),
      ),
    ];

    for (const result of results) {
      const decoded = Schema.decodeUnknownSync(Event)(
        JSON.parse(JSON.stringify(result)),
      );
      expect(decoded.type).toBeDefined();
    }
  });
});
