import { StoryEntity } from "@liexp/backend/lib/entities/Story.entity.js";
import { mockedContext } from "@liexp/backend/lib/test/context.js";
import { mockTERightOnce } from "@liexp/backend/lib/test/mocks/mock.utils.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { type UUID } from "@liexp/io/lib/http/Common/UUID.js";
import { EVENT_TYPES } from "@liexp/io/lib/http/Events/EventType.js";
import { throwRTE } from "@liexp/shared/lib/utils/fp.utils.js";
import * as tests from "@liexp/test";
import { UncategorizedArb } from "@liexp/test/lib/arbitrary/events/Uncategorized.arbitrary.js";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { mockDeep } from "vitest-mock-extended";
import { type ServerContext } from "../../../context/context.type.js";
import { mergeEventsFlow } from "../mergeEvents.flow.js";

/**
 * Unit tests for mergeEvents.flow.ts
 *
 * These tests mock the database context and verify the flow logic
 * without requiring an actual database connection.
 */

type MergeEventsContext = Pick<ServerContext, "db" | "logger" | "env">;

describe("mergeEventsFlow", () => {
  const createMockedContext = () => {
    const dbMock = mockDeep<ServerContext["db"]>();
    return mockedContext<MergeEventsContext>({
      db: dbMock,
    });
  };

  let ctx: ReturnType<typeof createMockedContext>;

  beforeEach(() => {
    ctx = createMockedContext();
    vi.clearAllMocks();
  });

  /**
   * Helper to mock all the database calls needed for a successful merge operation.
   * The flow makes the following calls:
   * 1. db.find - to load events with relations
   * 2. db.execQuery - called by fetchEventsRelations for actors, groups, keywords, media, links
   * 3. db.transaction - wraps the save, story update, and soft delete operations
   */
  const mockSuccessfulMerge = (
    events: any[],
    target: any,
    options: {
      stories?: any[];
      trackSoftDeleteIds?: UUID[];
      trackSavedStoryEvents?: any[];
    } = {},
  ) => {
    const { stories = [], trackSoftDeleteIds, trackSavedStoryEvents } = options;

    // 1. Mock initial event find
    mockTERightOnce(ctx.db.find, () => events);

    // 2. Mock relation queries (execQuery is used by fetch queries)
    // fetchActors, fetchGroups, fetchKeywords, fetchManyMedia, fetchLinks
    // Each returns [results, count] tuple
    for (let i = 0; i < 5; i++) {
      mockTERightOnce(ctx.db.execQuery, () => [[], 0]);
    }

    // 3. Mock transaction with all inner operations
    ctx.db.transaction.mockImplementation((callback: any) => {
      const txCtx = {
        save: vi.fn((entity: any, data: any) => {
          if (entity === StoryEntity && trackSavedStoryEvents) {
            trackSavedStoryEvents.push(...(data?.[0]?.events ?? []));
          }
          return fp.TE.right(data ?? [target]);
        }),
        find: vi.fn((entity: any) => {
          if (entity === StoryEntity) {
            return fp.TE.right(stories);
          }
          return fp.TE.right([]);
        }),
        softDelete: vi.fn((_: any, ids: UUID[]) => {
          if (trackSoftDeleteIds) {
            trackSoftDeleteIds.push(...(ids ?? []));
          }
          return fp.TE.right({ affected: ids?.length ?? 0 });
        }),
        findOneOrFail: vi.fn(() =>
          fp.TE.right({
            ...target,
            links: target.links?.map((l: any) => l.id ?? l) ?? [],
            media: target.media?.map((m: any) => m.id ?? m) ?? [],
            keywords: target.keywords?.map((k: any) => k.id ?? k) ?? [],
          }),
        ),
      };
      return callback(txCtx);
    });
  };

  describe("Input Validation", () => {
    test("Should return BadRequestError when less than 2 IDs provided", async () => {
      const singleId = tests.fc.sample(tests.fc.uuid(), 1)[0] as UUID;

      const result = await pipe(mergeEventsFlow([singleId]), (rte) =>
        rte(ctx as unknown as ServerContext),
      )();

      expect(result._tag).toBe("Left");
      if (result._tag === "Left") {
        expect(result.left.status).toBe(400);
        expect(result.left.details.kind).toBe("ClientError");
      }
    });

    test("Should return BadRequestError when empty array provided", async () => {
      const result = await pipe(mergeEventsFlow([]), (rte) =>
        rte(ctx as unknown as ServerContext),
      )();

      expect(result._tag).toBe("Left");
      if (result._tag === "Left") {
        expect(result.left.status).toBe(400);
      }
    });

    test("Should return NotFoundError when events do not exist", async () => {
      const nonExistentIds = tests.fc.sample(tests.fc.uuid(), 2) as UUID[];

      // Mock find to return empty array (no events found)
      mockTERightOnce(ctx.db.find, () => []);

      const result = await pipe(mergeEventsFlow(nonExistentIds), (rte) =>
        rte(ctx as unknown as ServerContext),
      )();

      expect(result._tag).toBe("Left");
      if (result._tag === "Left") {
        expect(result.left.status).toBe(404);
      }
    });

    test("Should return NotFoundError when only one event exists", async () => {
      const [ev] = tests.fc.sample(UncategorizedArb, 1);
      const event = {
        ...ev,
        id: tests.fc.sample(tests.fc.uuid(), 1)[0] as UUID,
        draft: false,
        payload: { ...ev.payload, actors: [], groups: [], groupsMembers: [] },
        links: [],
        media: [],
        keywords: [],
        location: null,
      };

      const nonExistentId = tests.fc.sample(tests.fc.uuid(), 1)[0] as UUID;

      // Mock find to return only one event
      mockTERightOnce(ctx.db.find, () => [event]);

      const result = await pipe(
        mergeEventsFlow([event.id, nonExistentId]),
        (rte) => rte(ctx as unknown as ServerContext),
      )();

      expect(result._tag).toBe("Left");
      if (result._tag === "Left") {
        expect(result.left.status).toBe(404);
      }
    });
  });

  describe("Merging Uncategorized Events", () => {
    test("Should merge two Uncategorized events successfully", async () => {
      const [e1, e2] = tests.fc.sample(UncategorizedArb, 2);
      const event1Id = tests.fc.sample(tests.fc.uuid(), 1)[0] as UUID;
      const event2Id = tests.fc.sample(tests.fc.uuid(), 1)[0] as UUID;

      const event1 = {
        ...e1,
        id: event1Id,
        type: EVENT_TYPES.UNCATEGORIZED,
        draft: false,
        payload: {
          ...e1.payload,
          title: "Event1",
          actors: [],
          groups: [],
          groupsMembers: [],
        },
        links: [],
        media: [],
        keywords: [],
        location: null,
      };

      const event2 = {
        ...e2,
        id: event2Id,
        type: EVENT_TYPES.UNCATEGORIZED,
        draft: false,
        payload: {
          ...e2.payload,
          title: "Event2",
          actors: [],
          groups: [],
          groupsMembers: [],
        },
        links: [],
        media: [],
        keywords: [],
        location: null,
      };

      mockSuccessfulMerge([event1, event2], event1);

      const result = await pipe(mergeEventsFlow([event1Id, event2Id]), (rte) =>
        rte(ctx as unknown as ServerContext),
      )();

      expect(result._tag).toBe("Right");
      if (result._tag === "Right") {
        expect(result.right.id).toBe(event1Id);
        expect(result.right.type).toBe(EVENT_TYPES.UNCATEGORIZED);
      }

      // Verify transaction was called
      expect(ctx.db.transaction).toHaveBeenCalled();
    });

    test("Should merge three events and soft-delete source events", async () => {
      const [e1, e2, e3] = tests.fc.sample(UncategorizedArb, 3);
      const event1Id = tests.fc.sample(tests.fc.uuid(), 1)[0] as UUID;
      const event2Id = tests.fc.sample(tests.fc.uuid(), 1)[0] as UUID;
      const event3Id = tests.fc.sample(tests.fc.uuid(), 1)[0] as UUID;

      const event1 = {
        ...e1,
        id: event1Id,
        type: EVENT_TYPES.UNCATEGORIZED,
        draft: false,
        payload: { ...e1.payload, actors: [], groups: [], groupsMembers: [] },
        links: [],
        media: [],
        keywords: [],
        location: null,
      };

      const event2 = {
        ...e2,
        id: event2Id,
        type: EVENT_TYPES.UNCATEGORIZED,
        draft: false,
        payload: { ...e2.payload, actors: [], groups: [], groupsMembers: [] },
        links: [],
        media: [],
        keywords: [],
        location: null,
      };

      const event3 = {
        ...e3,
        id: event3Id,
        type: EVENT_TYPES.UNCATEGORIZED,
        draft: false,
        payload: { ...e3.payload, actors: [], groups: [], groupsMembers: [] },
        links: [],
        media: [],
        keywords: [],
        location: null,
      };

      const softDeletedIds: UUID[] = [];
      mockSuccessfulMerge([event1, event2, event3], event1, {
        trackSoftDeleteIds: softDeletedIds,
      });

      const result = await pipe(
        mergeEventsFlow([event1Id, event2Id, event3Id]),
        (rte) => rte(ctx as unknown as ServerContext),
      )();

      expect(result._tag).toBe("Right");
      if (result._tag === "Right") {
        expect(result.right.id).toBe(event1Id);
      }

      // Verify that source events (event2 and event3) were soft-deleted
      expect(softDeletedIds).toContain(event2Id);
      expect(softDeletedIds).toContain(event3Id);
      expect(softDeletedIds).not.toContain(event1Id);
    });

    test("Should preserve target event order based on first ID", async () => {
      const [e1, e2] = tests.fc.sample(UncategorizedArb, 2);
      const targetId = tests.fc.sample(tests.fc.uuid(), 1)[0] as UUID;
      const sourceId = tests.fc.sample(tests.fc.uuid(), 1)[0] as UUID;

      const targetEvent = {
        ...e1,
        id: targetId,
        type: EVENT_TYPES.UNCATEGORIZED,
        draft: false,
        date: new Date("2020-01-01"),
        payload: { ...e1.payload, actors: [], groups: [], groupsMembers: [] },
        links: [],
        media: [],
        keywords: [],
        location: null,
      };

      const sourceEvent = {
        ...e2,
        id: sourceId,
        type: EVENT_TYPES.UNCATEGORIZED,
        draft: false,
        date: new Date("2021-01-01"),
        payload: { ...e2.payload, actors: [], groups: [], groupsMembers: [] },
        links: [],
        media: [],
        keywords: [],
        location: null,
      };

      mockSuccessfulMerge([targetEvent, sourceEvent], targetEvent);

      const result = await pipe(
        mergeEventsFlow([targetId, sourceId]),
        throwRTE(ctx),
      );

      expect(result.id).toBe(targetId);
    });
  });

  describe("Story Reference Updates", () => {
    test("Should update stories referencing source events to target event", async () => {
      const [e1, e2] = tests.fc.sample(UncategorizedArb, 2);
      const targetId = tests.fc.sample(tests.fc.uuid(), 1)[0] as UUID;
      const sourceId = tests.fc.sample(tests.fc.uuid(), 1)[0] as UUID;
      const storyId = tests.fc.sample(tests.fc.uuid(), 1)[0] as UUID;

      const targetEvent = {
        ...e1,
        id: targetId,
        type: EVENT_TYPES.UNCATEGORIZED,
        draft: false,
        payload: { ...e1.payload, actors: [], groups: [], groupsMembers: [] },
        links: [],
        media: [],
        keywords: [],
        location: null,
      };

      const sourceEvent = {
        ...e2,
        id: sourceId,
        type: EVENT_TYPES.UNCATEGORIZED,
        draft: false,
        payload: { ...e2.payload, actors: [], groups: [], groupsMembers: [] },
        links: [],
        media: [],
        keywords: [],
        location: null,
      };

      const story = {
        id: storyId,
        events: [{ id: sourceId }],
      };

      const savedStoryEvents: any[] = [];
      mockSuccessfulMerge([targetEvent, sourceEvent], targetEvent, {
        stories: [story],
        trackSavedStoryEvents: savedStoryEvents,
      });

      const result = await pipe(mergeEventsFlow([targetId, sourceId]), (rte) =>
        rte(ctx as unknown as ServerContext),
      )();

      expect(result._tag).toBe("Right");

      // Verify story events were updated to reference target
      const storyEventIds = savedStoryEvents.map((e: any) => e.id);
      expect(storyEventIds).toContain(targetId);
      expect(storyEventIds).not.toContain(sourceId);
    });

    test("Should handle story referencing both target and source without duplicates", async () => {
      const [e1, e2] = tests.fc.sample(UncategorizedArb, 2);
      const targetId = tests.fc.sample(tests.fc.uuid(), 1)[0] as UUID;
      const sourceId = tests.fc.sample(tests.fc.uuid(), 1)[0] as UUID;
      const storyId = tests.fc.sample(tests.fc.uuid(), 1)[0] as UUID;

      const targetEvent = {
        ...e1,
        id: targetId,
        type: EVENT_TYPES.UNCATEGORIZED,
        draft: false,
        payload: { ...e1.payload, actors: [], groups: [], groupsMembers: [] },
        links: [],
        media: [],
        keywords: [],
        location: null,
      };

      const sourceEvent = {
        ...e2,
        id: sourceId,
        type: EVENT_TYPES.UNCATEGORIZED,
        draft: false,
        payload: { ...e2.payload, actors: [], groups: [], groupsMembers: [] },
        links: [],
        media: [],
        keywords: [],
        location: null,
      };

      // Story references both events
      const story = {
        id: storyId,
        events: [{ id: targetId }, { id: sourceId }],
      };

      const savedStoryEvents: any[] = [];
      mockSuccessfulMerge([targetEvent, sourceEvent], targetEvent, {
        stories: [story],
        trackSavedStoryEvents: savedStoryEvents,
      });

      const result = await pipe(mergeEventsFlow([targetId, sourceId]), (rte) =>
        rte(ctx as unknown as ServerContext),
      )();

      expect(result._tag).toBe("Right");

      // Story should reference target once (no duplicates)
      const storyEventIds = savedStoryEvents.map((e: any) => e.id);
      expect(storyEventIds).toContain(targetId);
      expect(storyEventIds).not.toContain(sourceId);
      expect(storyEventIds.filter((id: UUID) => id === targetId)).toHaveLength(
        1,
      );
    });
  });

  describe("Edge Cases", () => {
    test("Should handle events with no relations", async () => {
      const [e1, e2] = tests.fc.sample(UncategorizedArb, 2);
      const event1Id = tests.fc.sample(tests.fc.uuid(), 1)[0] as UUID;
      const event2Id = tests.fc.sample(tests.fc.uuid(), 1)[0] as UUID;

      const emptyEvent1 = {
        ...e1,
        id: event1Id,
        type: EVENT_TYPES.UNCATEGORIZED,
        draft: false,
        payload: { ...e1.payload, actors: [], groups: [], groupsMembers: [] },
        links: [],
        media: [],
        keywords: [],
        location: null,
      };

      const emptyEvent2 = {
        ...e2,
        id: event2Id,
        type: EVENT_TYPES.UNCATEGORIZED,
        draft: false,
        payload: { ...e2.payload, actors: [], groups: [], groupsMembers: [] },
        links: [],
        media: [],
        keywords: [],
        location: null,
      };

      mockSuccessfulMerge([emptyEvent1, emptyEvent2], emptyEvent1);

      const result = await pipe(mergeEventsFlow([event1Id, event2Id]), (rte) =>
        rte(ctx as unknown as ServerContext),
      )();

      expect(result._tag).toBe("Right");
      if (result._tag === "Right") {
        expect(result.right.id).toBe(event1Id);
        expect(result.right.links).toHaveLength(0);
        expect(result.right.media).toHaveLength(0);
        expect(result.right.keywords).toHaveLength(0);
      }
    });

    test("Should handle merging when no stories reference the events", async () => {
      const [e1, e2] = tests.fc.sample(UncategorizedArb, 2);
      const event1Id = tests.fc.sample(tests.fc.uuid(), 1)[0] as UUID;
      const event2Id = tests.fc.sample(tests.fc.uuid(), 1)[0] as UUID;

      const event1 = {
        ...e1,
        id: event1Id,
        type: EVENT_TYPES.UNCATEGORIZED,
        draft: false,
        payload: { ...e1.payload, actors: [], groups: [], groupsMembers: [] },
        links: [],
        media: [],
        keywords: [],
        location: null,
      };

      const event2 = {
        ...e2,
        id: event2Id,
        type: EVENT_TYPES.UNCATEGORIZED,
        draft: false,
        payload: { ...e2.payload, actors: [], groups: [], groupsMembers: [] },
        links: [],
        media: [],
        keywords: [],
        location: null,
      };

      mockSuccessfulMerge([event1, event2], event1);

      const result = await pipe(mergeEventsFlow([event1Id, event2Id]), (rte) =>
        rte(ctx as unknown as ServerContext),
      )();

      expect(result._tag).toBe("Right");
      // Verify transaction was called (implying story find was executed)
      expect(ctx.db.transaction).toHaveBeenCalled();
    });
  });

  describe("Soft Deletion Verification", () => {
    test("Should call softDelete with source event IDs only", async () => {
      const [e1, e2] = tests.fc.sample(UncategorizedArb, 2);
      const targetId = tests.fc.sample(tests.fc.uuid(), 1)[0] as UUID;
      const sourceId = tests.fc.sample(tests.fc.uuid(), 1)[0] as UUID;

      const targetEvent = {
        ...e1,
        id: targetId,
        type: EVENT_TYPES.UNCATEGORIZED,
        draft: false,
        payload: { ...e1.payload, actors: [], groups: [], groupsMembers: [] },
        links: [],
        media: [],
        keywords: [],
        location: null,
      };

      const sourceEvent = {
        ...e2,
        id: sourceId,
        type: EVENT_TYPES.UNCATEGORIZED,
        draft: false,
        payload: { ...e2.payload, actors: [], groups: [], groupsMembers: [] },
        links: [],
        media: [],
        keywords: [],
        location: null,
      };

      const softDeletedIds: UUID[] = [];
      mockSuccessfulMerge([targetEvent, sourceEvent], targetEvent, {
        trackSoftDeleteIds: softDeletedIds,
      });

      await pipe(mergeEventsFlow([targetId, sourceId]), (rte) =>
        rte(ctx as unknown as ServerContext),
      )();

      expect(softDeletedIds).toEqual([sourceId]);
      expect(softDeletedIds).not.toContain(targetId);
    });
  });
});
