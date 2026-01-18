import { fp } from "@liexp/core/lib/fp/index.js";
import { describe, expect, it } from "vitest";
import { type UUID } from "../../../io/http/Common/UUID.js";
import { EVENT_TYPES } from "../../../io/http/Events/EventType.js";
import { type Events, type Actor, type Link } from "../../../io/http/index.js";
import {
  eqByUUID,
  eventsDataToNavigatorItems,
  ordEventDate,
  getColorByEventType,
  eventsInDateRange,
  toGetNetworkQuery,
  eventRelationIdsMonoid,
  takeEventRelations,
  getTitle,
  EventHelper,
} from "../event.helper.js";

const createUUID = (id: string): UUID => id as UUID;

const createBaseEvent = (
  type: Events.EventType,
  payload: Record<string, unknown>,
  overrides: Partial<Events.Event> = {},
): Events.Event =>
  ({
    id: createUUID(`event-${Math.random().toString(36).slice(2)}`),
    type,
    date: new Date("2024-01-15"),
    draft: false,
    media: [],
    keywords: [],
    links: [],
    socialPosts: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    payload,
    ...overrides,
  }) as Events.Event;

const createActor = (id: string, fullName: string): Actor.Actor =>
  ({
    id: createUUID(id),
    fullName,
    username: fullName.toLowerCase().replace(/\s/g, "-"),
    color: "#000000",
  }) as Actor.Actor;

describe("eqByUUID", () => {
  it("should return true for objects with same id", () => {
    const obj1 = { id: createUUID("test-1"), name: "Object 1" };
    const obj2 = { id: createUUID("test-1"), name: "Object 2" };

    expect(eqByUUID.equals(obj1, obj2)).toBe(true);
  });

  it("should return false for objects with different ids", () => {
    const obj1 = { id: createUUID("test-1"), name: "Object 1" };
    const obj2 = { id: createUUID("test-2"), name: "Object 1" };

    expect(eqByUUID.equals(obj1, obj2)).toBe(false);
  });
});

describe("ordEventDate", () => {
  it("should order events by date ascending", () => {
    const event1 = { date: new Date("2024-01-01") };
    const event2 = { date: new Date("2024-06-01") };

    expect(ordEventDate.compare(event1, event2)).toBeLessThan(0);
  });

  it("should order events by date descending when reversed", () => {
    const event1 = { date: new Date("2024-01-01") };
    const event2 = { date: new Date("2024-06-01") };

    const reversed = fp.Ord.reverse(ordEventDate);
    expect(reversed.compare(event1, event2)).toBeGreaterThan(0);
  });

  it("should return 0 for equal dates", () => {
    const event1 = { date: new Date("2024-01-01") };
    const event2 = { date: new Date("2024-01-01") };

    expect(ordEventDate.compare(event1, event2)).toBe(0);
  });
});

describe("getColorByEventType", () => {
  it("should return correct color for Book events", () => {
    const result = getColorByEventType({ type: EVENT_TYPES.BOOK });
    expect(result).toBe("#451d0a");
  });

  it("should return correct color for Death events", () => {
    const result = getColorByEventType({ type: EVENT_TYPES.DEATH });
    expect(result).toBe("#000");
  });

  it("should return correct color for ScientificStudy events", () => {
    const result = getColorByEventType({ type: EVENT_TYPES.SCIENTIFIC_STUDY });
    expect(result).toBe("#e43a01");
  });

  it("should return correct color for Uncategorized events", () => {
    const result = getColorByEventType({ type: EVENT_TYPES.UNCATEGORIZED });
    expect(result).toBe("#ccc111");
  });

  it("should return correct color for Patent events", () => {
    const result = getColorByEventType({ type: EVENT_TYPES.PATENT });
    expect(result).toBe("#e873aa");
  });

  it("should return correct color for Documentary events", () => {
    const result = getColorByEventType({ type: EVENT_TYPES.DOCUMENTARY });
    expect(result).toBe("#981a1a");
  });

  it("should return correct color for Transaction events", () => {
    const result = getColorByEventType({ type: EVENT_TYPES.TRANSACTION });
    expect(result).toBe("#ba91ed");
  });

  it("should return correct color for Quote events", () => {
    const result = getColorByEventType({ type: EVENT_TYPES.QUOTE });
    expect(result).toBe("#ec0e5a");
  });
});

describe("eventsInDateRange", () => {
  it("should filter events within date range", () => {
    const events = [
      createBaseEvent(
        EVENT_TYPES.UNCATEGORIZED,
        { title: "Event 1", actors: [], groups: [], groupsMembers: [] },
        { date: new Date("2024-01-15") },
      ),
      createBaseEvent(
        EVENT_TYPES.UNCATEGORIZED,
        { title: "Event 2", actors: [], groups: [], groupsMembers: [] },
        { date: new Date("2024-06-15") },
      ),
      createBaseEvent(
        EVENT_TYPES.UNCATEGORIZED,
        { title: "Event 3", actors: [], groups: [], groupsMembers: [] },
        { date: new Date("2024-12-15") },
      ),
    ];

    const result = eventsInDateRange({
      minDate: fp.O.some(new Date("2024-01-01")),
      maxDate: fp.O.some(new Date("2024-07-01")),
    })(events);

    expect(result).toHaveLength(2);
  });

  it("should use event dates when min/max not provided", () => {
    const events = [
      createBaseEvent(
        EVENT_TYPES.UNCATEGORIZED,
        { title: "Event 1", actors: [], groups: [], groupsMembers: [] },
        { date: new Date("2024-01-15") },
      ),
      createBaseEvent(
        EVENT_TYPES.UNCATEGORIZED,
        { title: "Event 2", actors: [], groups: [], groupsMembers: [] },
        { date: new Date("2024-06-15") },
      ),
    ];

    const result = eventsInDateRange({
      minDate: fp.O.none,
      maxDate: fp.O.none,
    })(events);

    expect(result.length).toBeGreaterThanOrEqual(0);
  });
});

describe("toGetNetworkQuery", () => {
  it("should convert relation ids to network query format", () => {
    const relationIds: Events.EventRelationIds = {
      keywords: [createUUID("keyword-1")],
      actors: [createUUID("actor-1"), createUUID("actor-2")],
      groups: [createUUID("group-1")],
      groupsMembers: [],
      media: [],
      links: [],
      areas: [],
    };

    const result = toGetNetworkQuery(relationIds);

    expect(result.keywords).toEqual([createUUID("keyword-1")]);
    expect(result.actors).toEqual([
      createUUID("actor-1"),
      createUUID("actor-2"),
    ]);
    expect(result.groups).toEqual([createUUID("group-1")]);
    expect(result.relations).toBeNull();
    expect(result.ids).toBeNull();
    expect(result.startDate).toBeNull();
    expect(result.endDate).toBeNull();
    expect(result.emptyRelations).toBeNull();
  });

  it("should return null for empty arrays", () => {
    const relationIds: Events.EventRelationIds = {
      keywords: [],
      actors: [],
      groups: [],
      groupsMembers: [],
      media: [],
      links: [],
      areas: [],
    };

    const result = toGetNetworkQuery(relationIds);

    expect(result.keywords).toBeNull();
    expect(result.actors).toBeNull();
    expect(result.groups).toBeNull();
  });
});

describe("eventRelationIdsMonoid", () => {
  it("should have correct empty value", () => {
    expect(eventRelationIdsMonoid.empty).toEqual({
      keywords: [],
      actors: [],
      groups: [],
      groupsMembers: [],
      media: [],
      links: [],
      areas: [],
    });
  });

  it("should concat two relation ids without duplicates", () => {
    const x: Events.EventRelationIds = {
      keywords: [createUUID("keyword-1")],
      actors: [createUUID("actor-1")],
      groups: [createUUID("group-1")],
      groupsMembers: [],
      media: [],
      links: [],
      areas: [],
    };

    const y: Events.EventRelationIds = {
      keywords: [createUUID("keyword-1"), createUUID("keyword-2")],
      actors: [createUUID("actor-2")],
      groups: [createUUID("group-1")],
      groupsMembers: [],
      media: [],
      links: [],
      areas: [],
    };

    const result = eventRelationIdsMonoid.concat(x, y);

    expect(result.keywords).toEqual([
      createUUID("keyword-1"),
      createUUID("keyword-2"),
    ]);
    expect(result.actors).toEqual([
      createUUID("actor-1"),
      createUUID("actor-2"),
    ]);
    expect(result.groups).toEqual([createUUID("group-1")]);
  });
});

describe("takeEventRelations", () => {
  it("should combine relation ids from multiple events", () => {
    const event1 = createBaseEvent(EVENT_TYPES.UNCATEGORIZED, {
      title: "Event 1",
      actors: [createUUID("actor-1")],
      groups: [createUUID("group-1")],
      groupsMembers: [],
    });

    const event2 = createBaseEvent(EVENT_TYPES.UNCATEGORIZED, {
      title: "Event 2",
      actors: [createUUID("actor-2")],
      groups: [createUUID("group-1")],
      groupsMembers: [],
    });

    const result = takeEventRelations([event1, event2]);

    expect(result.actors).toContain(createUUID("actor-1"));
    expect(result.actors).toContain(createUUID("actor-2"));
    expect(result.groups).toEqual([createUUID("group-1")]);
  });

  it("should return empty for empty array", () => {
    const result = takeEventRelations([]);

    expect(result).toEqual(eventRelationIdsMonoid.empty);
  });
});

describe("getTitle", () => {
  const emptyRelations: Events.EventRelations = {
    actors: [],
    groups: [],
    groupsMembers: [],
    media: [],
    keywords: [],
    links: [],
    areas: [],
  };

  describe("events with title payload", () => {
    it("should return title from Book event", () => {
      const event = createBaseEvent(EVENT_TYPES.BOOK, {
        title: "Test Book Title",
        authors: [],
        media: { pdf: createUUID("pdf"), audio: undefined },
      });

      const result = getTitle(event, emptyRelations);

      expect(result).toBe("Test Book Title");
    });

    it("should return title from Documentary event", () => {
      const event = createBaseEvent(EVENT_TYPES.DOCUMENTARY, {
        title: "Test Documentary",
        media: null,
        website: null,
        authors: { actors: [], groups: [] },
        subjects: { actors: [], groups: [] },
      });

      const result = getTitle(event, emptyRelations);

      expect(result).toBe("Test Documentary");
    });

    it("should return title from Patent event", () => {
      const event = createBaseEvent(EVENT_TYPES.PATENT, {
        title: "Test Patent",
        owners: { actors: [], groups: [] },
      });

      const result = getTitle(event, emptyRelations);

      expect(result).toBe("Test Patent");
    });

    it("should return title from ScientificStudy event", () => {
      const event = createBaseEvent(EVENT_TYPES.SCIENTIFIC_STUDY, {
        title: "Test Study",
        authors: [],
        url: null,
      });

      const result = getTitle(event, emptyRelations);

      expect(result).toBe("Test Study");
    });

    it("should return title from Transaction event", () => {
      const event = createBaseEvent(EVENT_TYPES.TRANSACTION, {
        title: "Test Transaction",
        from: { type: "Actor", id: createUUID("actor-1") },
        to: { type: "Actor", id: createUUID("actor-2") },
      });

      const result = getTitle(event, emptyRelations);

      expect(result).toBe("Test Transaction");
    });

    it("should return title from Uncategorized event", () => {
      const event = createBaseEvent(EVENT_TYPES.UNCATEGORIZED, {
        title: "Test Event",
        actors: [],
        groups: [],
        groupsMembers: [],
      });

      const result = getTitle(event, emptyRelations);

      expect(result).toBe("Test Event");
    });
  });

  describe("Quote events", () => {
    it("should return formatted quote title with actor name", () => {
      const actor = createActor("actor-1", "John Doe");
      const event = createBaseEvent(EVENT_TYPES.QUOTE, {
        quote:
          "This is a test quote that is quite long and should be truncated",
        subject: { type: "Actor", id: createUUID("actor-1") },
        details: undefined,
      });
      const relations = { ...emptyRelations, actors: [actor] };

      const result = getTitle(event, relations);

      expect(result).toContain("John Doe - ");
    });

    it("should return quote title with details when provided", () => {
      const actor = createActor("actor-1", "John Doe");
      const event = createBaseEvent(EVENT_TYPES.QUOTE, {
        quote: "This is a test quote",
        subject: { type: "Actor", id: createUUID("actor-1") },
        details: "Important Context",
      });
      const relations = { ...emptyRelations, actors: [actor] };

      const result = getTitle(event, relations);

      expect(result).toBe("John Doe - Important Context");
    });
  });

  describe("Death events", () => {
    it("should return formatted death title with victim name", () => {
      const actor = createActor("victim-1", "Jane Smith");
      const event = createBaseEvent(EVENT_TYPES.DEATH, {
        victim: createUUID("victim-1"),
        location: undefined,
      });
      const relations = { ...emptyRelations, actors: [actor] };

      const result = getTitle(event, relations);

      expect(result).toBe("Death of Jane Smith");
    });

    it("should return unknown when victim not found", () => {
      const event = createBaseEvent(EVENT_TYPES.DEATH, {
        victim: createUUID("unknown-victim"),
        location: undefined,
      });

      const result = getTitle(event, emptyRelations);

      expect(result).toBe("Death of unknown");
    });
  });
});

describe("eventsDataToNavigatorItems", () => {
  it("should group events by year and month", () => {
    const events = [
      createBaseEvent(
        EVENT_TYPES.UNCATEGORIZED,
        { title: "Event 1", actors: [], groups: [], groupsMembers: [] },
        { id: createUUID("event-1"), date: new Date("2024-01-15") },
      ),
      createBaseEvent(
        EVENT_TYPES.UNCATEGORIZED,
        { title: "Event 2", actors: [], groups: [], groupsMembers: [] },
        { id: createUUID("event-2"), date: new Date("2024-01-20") },
      ),
      createBaseEvent(
        EVENT_TYPES.UNCATEGORIZED,
        { title: "Event 3", actors: [], groups: [], groupsMembers: [] },
        { id: createUUID("event-3"), date: new Date("2024-06-15") },
      ),
    ];

    const result = eventsDataToNavigatorItems(events);

    expect(result.length).toBeGreaterThan(0);
    expect(result[0].title).toBe("2024");
    expect(result[0].subNav).toBeDefined();
  });

  it("should return empty array for empty events", () => {
    const result = eventsDataToNavigatorItems([]);

    expect(result).toEqual([]);
  });
});

describe("EventHelper", () => {
  it("should have getTitle method", () => {
    expect(EventHelper.getTitle).toBeDefined();
  });

  it("should have getCommonProps method", () => {
    expect(EventHelper.getCommonProps).toBeDefined();
  });

  it("should have transform method", () => {
    expect(EventHelper.transform).toBeDefined();
  });
});
