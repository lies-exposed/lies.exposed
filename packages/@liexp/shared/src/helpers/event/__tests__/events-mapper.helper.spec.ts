import { type UUID } from "@liexp/io/lib/http/Common/UUID.js";
import { EVENT_TYPES } from "@liexp/io/lib/http/Events/EventType.js";
import type * as Events from "@liexp/io/lib/http/Events/index.js";
import { describe, expect, it } from "vitest";
import {
  getNewRelationIds,
  updateCache,
  getTotals,
} from "../events-mapper.helper.js";

const createUUID = (id: string): UUID => id as UUID;

const createEvent = (
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

const createActor = (id: string): Events.EventRelations["actors"][number] =>
  ({
    id: createUUID(id),
    fullName: `Actor ${id}`,
    username: `actor-${id}`,
    color: "#000000",
  }) as Events.EventRelations["actors"][number];

const createGroup = (id: string): Events.EventRelations["groups"][number] =>
  ({
    id: createUUID(id),
    name: `Group ${id}`,
  }) as Events.EventRelations["groups"][number];

const createMedia = (id: string): Events.EventRelations["media"][number] =>
  ({
    id: createUUID(id),
    url: `https://example.com/media/${id}`,
  }) as Events.EventRelations["media"][number];

const createKeyword = (id: string): Events.EventRelations["keywords"][number] =>
  ({
    id: createUUID(id),
    name: `Keyword ${id}`,
  }) as Events.EventRelations["keywords"][number];

const createLink = (id: string): Events.EventRelations["links"][number] =>
  ({
    id: createUUID(id),
    url: `https://example.com/link/${id}`,
  }) as Events.EventRelations["links"][number];

const createArea = (id: string): Events.EventRelations["areas"][number] =>
  ({
    id: createUUID(id),
    name: `Area ${id}`,
  }) as Events.EventRelations["areas"][number];

describe("@helpers/event/events-mapper", () => {
  describe("getNewRelationIds", () => {
    it("should extract new relation ids from events, excluding cached ids", () => {
      const cachedActors = [createActor("cached-1")];
      const cachedGroups = [createGroup("cached-1")];
      const cachedMedia = [createMedia("cached-1")];
      const cachedKeywords = [createKeyword("cached-1")];
      const cachedLinks = [createLink("cached-1")];
      const cachedAreas = [createArea("cached-1")];

      const uncategorizedEvent = createEvent(EVENT_TYPES.UNCATEGORIZED, {
        title: "Test",
        actors: [createUUID("new-1")],
        groups: [createUUID("new-1")],
        groupsMembers: [],
      });

      const cache = {
        actors: cachedActors,
        groups: cachedGroups,
        groupsMembers: [],
        media: cachedMedia,
        keywords: cachedKeywords,
        links: cachedLinks,
        areas: cachedAreas,
      };

      const result = getNewRelationIds([uncategorizedEvent], cache);

      expect(result.actors).toContain("new-1");
      expect(result.actors).not.toContain("cached-1");
      expect(result.groups).toContain("new-1");
      expect(result.groups).not.toContain("cached-1");
      expect(result.media).not.toContain("cached-1");
      expect(result.keywords).not.toContain("cached-1");
      expect(result.links).not.toContain("cached-1");
      expect(result.areas).not.toContain("cached-1");
      expect(result.groupsMembers).toEqual([]);
      expect(result.socialPosts).toEqual([]);
    });

    it("should handle empty events array", () => {
      const cache = {
        actors: [createActor("a1")],
        groups: [createGroup("g1")],
        groupsMembers: [],
        media: [createMedia("m1")],
        keywords: [createKeyword("k1")],
        links: [createLink("l1")],
        areas: [createArea("ar1")],
      };

      const result = getNewRelationIds([], cache);

      expect(result.actors).toEqual([]);
      expect(result.groups).toEqual([]);
      expect(result.media).toEqual([]);
      expect(result.keywords).toEqual([]);
      expect(result.links).toEqual([]);
      expect(result.areas).toEqual([]);
    });

    it("should handle death events with victim actor", () => {
      const cache = {
        actors: [] as Events.EventRelations["actors"],
        groups: [] as Events.EventRelations["groups"],
        groupsMembers: [] as Events.EventRelations["groupsMembers"],
        media: [] as Events.EventRelations["media"],
        keywords: [] as Events.EventRelations["keywords"],
        links: [] as Events.EventRelations["links"],
        areas: [] as Events.EventRelations["areas"],
      };

      const deathEvent = createEvent(EVENT_TYPES.DEATH, {
        victim: createUUID("victim-1"),
        location: undefined,
      });

      const result = getNewRelationIds([deathEvent], cache);

      expect(result.actors).toContain("victim-1");
    });

    it("should handle quote events with subject actor", () => {
      const cache = {
        actors: [] as Events.EventRelations["actors"],
        groups: [] as Events.EventRelations["groups"],
        groupsMembers: [] as Events.EventRelations["groupsMembers"],
        media: [] as Events.EventRelations["media"],
        keywords: [] as Events.EventRelations["keywords"],
        links: [] as Events.EventRelations["links"],
        areas: [] as Events.EventRelations["areas"],
      };

      const quoteEvent = createEvent(EVENT_TYPES.QUOTE, {
        quote: "Test quote",
        subject: { type: "Actor", id: createUUID("subject-1") },
      });

      const result = getNewRelationIds([quoteEvent], cache);

      expect(result.actors).toContain("subject-1");
    });

    it("should handle quote events with subject group", () => {
      const cache = {
        actors: [] as Events.EventRelations["actors"],
        groups: [] as Events.EventRelations["groups"],
        groupsMembers: [] as Events.EventRelations["groupsMembers"],
        media: [] as Events.EventRelations["media"],
        keywords: [] as Events.EventRelations["keywords"],
        links: [] as Events.EventRelations["links"],
        areas: [] as Events.EventRelations["areas"],
      };

      const quoteEvent = createEvent(EVENT_TYPES.QUOTE, {
        quote: "Test quote",
        subject: { type: "Group", id: createUUID("subject-group-1") },
      });

      const result = getNewRelationIds([quoteEvent], cache);

      expect(result.groups).toContain("subject-group-1");
      expect(result.actors).toEqual([]);
    });

    it("should handle transaction events with from/to subjects", () => {
      const cache = {
        actors: [] as Events.EventRelations["actors"],
        groups: [] as Events.EventRelations["groups"],
        groupsMembers: [] as Events.EventRelations["groupsMembers"],
        media: [] as Events.EventRelations["media"],
        keywords: [] as Events.EventRelations["keywords"],
        links: [] as Events.EventRelations["links"],
        areas: [] as Events.EventRelations["areas"],
      };

      const transactionEvent = createEvent(EVENT_TYPES.TRANSACTION, {
        from: {
          type: "Actor",
          id: createUUID("550e8400-e29b-41d4-a716-446655440001"),
        },
        to: {
          type: "Group",
          id: createUUID("550e8400-e29b-41d4-a716-446655440002"),
        },
      });

      const result = getNewRelationIds([transactionEvent], cache);

      expect(result.actors).toContain("550e8400-e29b-41d4-a716-446655440001");
      expect(result.groups).toContain("550e8400-e29b-41d4-a716-446655440002");
    });

    it("should aggregate relation ids across multiple events", () => {
      const cache = {
        actors: [] as Events.EventRelations["actors"],
        groups: [] as Events.EventRelations["groups"],
        groupsMembers: [] as Events.EventRelations["groupsMembers"],
        media: [] as Events.EventRelations["media"],
        keywords: [] as Events.EventRelations["keywords"],
        links: [] as Events.EventRelations["links"],
        areas: [] as Events.EventRelations["areas"],
      };

      const event1 = createEvent(EVENT_TYPES.UNCATEGORIZED, {
        title: "Event 1",
        actors: [createUUID("actor-1")],
        groups: [createUUID("group-1")],
        groupsMembers: [],
      });

      const event2 = createEvent(EVENT_TYPES.UNCATEGORIZED, {
        title: "Event 2",
        actors: [createUUID("actor-2")],
        groups: [createUUID("group-2")],
        groupsMembers: [],
      });

      const result = getNewRelationIds([event1, event2], cache);

      expect(result.actors).toContain("actor-1");
      expect(result.actors).toContain("actor-2");
      expect(result.groups).toContain("group-1");
      expect(result.groups).toContain("group-2");
    });
  });

  describe("updateCache", () => {
    it("should add new actors to cache", () => {
      const existingCache = {
        actors: [createActor("existing-1")],
        groups: [] as Events.EventRelations["groups"],
        groupsMembers: [] as Events.EventRelations["groupsMembers"],
        media: [] as Events.EventRelations["media"],
        keywords: [] as Events.EventRelations["keywords"],
        links: [] as Events.EventRelations["links"],
        areas: [] as Events.EventRelations["areas"],
        events: [] as Events.SearchEvent.SearchEvent[],
      };

      const update = {
        actors: [createActor("new-1"), createActor("existing-1")],
        groups: [],
        groupsMembers: [],
        media: [],
        keywords: [],
        links: [],
        events: {
          data: [],
          total: 0,
          totals: {} as Events.SearchEvent.EventTotals.EventTotals,
        },
      };

      const result = updateCache(existingCache, update);

      expect(result.actors.length).toBe(2);
      expect(result.actors.find((a) => a.id === "existing-1")).toBeDefined();
      expect(result.actors.find((a) => a.id === "new-1")).toBeDefined();
    });

    it("should add new groups to cache", () => {
      const existingCache = {
        actors: [] as Events.EventRelations["actors"],
        groups: [createGroup("existing-1")],
        groupsMembers: [] as Events.EventRelations["groupsMembers"],
        media: [] as Events.EventRelations["media"],
        keywords: [] as Events.EventRelations["keywords"],
        links: [] as Events.EventRelations["links"],
        areas: [] as Events.EventRelations["areas"],
        events: [] as Events.SearchEvent.SearchEvent[],
      };

      const update = {
        actors: [],
        groups: [createGroup("new-1"), createGroup("existing-1")],
        groupsMembers: [],
        media: [],
        keywords: [],
        links: [],
        events: {
          data: [],
          total: 0,
          totals: {} as Events.SearchEvent.EventTotals.EventTotals,
        },
      };

      const result = updateCache(existingCache, update);

      expect(result.groups.length).toBe(2);
      expect(result.groups.find((g) => g.id === "existing-1")).toBeDefined();
      expect(result.groups.find((g) => g.id === "new-1")).toBeDefined();
    });

    it("should add new groups members to cache", () => {
      const existingCache = {
        actors: [] as Events.EventRelations["actors"],
        groups: [] as Events.EventRelations["groups"],
        groupsMembers: [] as Events.EventRelations["groupsMembers"],
        media: [] as Events.EventRelations["media"],
        keywords: [] as Events.EventRelations["keywords"],
        links: [] as Events.EventRelations["links"],
        areas: [] as Events.EventRelations["areas"],
        events: [] as Events.SearchEvent.SearchEvent[],
      };

      const groupMember = {
        id: createUUID("gm-1"),
        name: "Group Member 1",
      } as Events.EventRelations["groupsMembers"][number];

      const update = {
        actors: [],
        groups: [],
        groupsMembers: [groupMember],
        media: [],
        keywords: [],
        links: [],
        events: {
          data: [],
          total: 0,
          totals: {} as Events.SearchEvent.EventTotals.EventTotals,
        },
      };

      const result = updateCache(existingCache, update);

      expect(result.groupsMembers.length).toBe(1);
      expect(result.groupsMembers[0].id).toBe("gm-1");
    });

    it("should add new media to cache", () => {
      const existingCache = {
        actors: [] as Events.EventRelations["actors"],
        groups: [] as Events.EventRelations["groups"],
        groupsMembers: [] as Events.EventRelations["groupsMembers"],
        media: [createMedia("existing-1")],
        keywords: [] as Events.EventRelations["keywords"],
        links: [] as Events.EventRelations["links"],
        areas: [] as Events.EventRelations["areas"],
        events: [] as Events.SearchEvent.SearchEvent[],
      };

      const update = {
        actors: [],
        groups: [],
        groupsMembers: [],
        media: [createMedia("new-1"), createMedia("existing-1")],
        keywords: [],
        links: [],
        events: {
          data: [],
          total: 0,
          totals: {} as Events.SearchEvent.EventTotals.EventTotals,
        },
      };

      const result = updateCache(existingCache, update);

      expect(result.media.length).toBe(2);
      expect(result.media.find((m) => m.id === "existing-1")).toBeDefined();
      expect(result.media.find((m) => m.id === "new-1")).toBeDefined();
    });

    it("should add new keywords to cache", () => {
      const existingCache = {
        actors: [] as Events.EventRelations["actors"],
        groups: [] as Events.EventRelations["groups"],
        groupsMembers: [] as Events.EventRelations["groupsMembers"],
        media: [] as Events.EventRelations["media"],
        keywords: [createKeyword("existing-1")],
        links: [] as Events.EventRelations["links"],
        areas: [] as Events.EventRelations["areas"],
        events: [] as Events.SearchEvent.SearchEvent[],
      };

      const update = {
        actors: [],
        groups: [],
        groupsMembers: [],
        media: [],
        keywords: [createKeyword("new-1"), createKeyword("existing-1")],
        links: [],
        events: {
          data: [],
          total: 0,
          totals: {} as Events.SearchEvent.EventTotals.EventTotals,
        },
      };

      const result = updateCache(existingCache, update);

      expect(result.keywords.length).toBe(2);
      expect(result.keywords.find((k) => k.id === "existing-1")).toBeDefined();
      expect(result.keywords.find((k) => k.id === "new-1")).toBeDefined();
    });

    it("should add new links to cache", () => {
      const existingCache = {
        actors: [] as Events.EventRelations["actors"],
        groups: [] as Events.EventRelations["groups"],
        groupsMembers: [] as Events.EventRelations["groupsMembers"],
        media: [] as Events.EventRelations["media"],
        keywords: [] as Events.EventRelations["keywords"],
        links: [createLink("existing-1")],
        areas: [] as Events.EventRelations["areas"],
        events: [] as Events.SearchEvent.SearchEvent[],
      };

      const update = {
        actors: [],
        groups: [],
        groupsMembers: [],
        media: [],
        keywords: [],
        links: [createLink("new-1"), createLink("existing-1")],
        events: {
          data: [],
          total: 0,
          totals: {} as Events.SearchEvent.EventTotals.EventTotals,
        },
      };

      const result = updateCache(existingCache, update);

      expect(result.links.length).toBe(2);
      expect(result.links.find((l) => l.id === "existing-1")).toBeDefined();
      expect(result.links.find((l) => l.id === "new-1")).toBeDefined();
    });

    it("should map events to search events", () => {
      const existingCache = {
        actors: [createActor("actor-1")],
        groups: [] as Events.EventRelations["groups"],
        groupsMembers: [] as Events.EventRelations["groupsMembers"],
        media: [] as Events.EventRelations["media"],
        keywords: [] as Events.EventRelations["keywords"],
        links: [] as Events.EventRelations["links"],
        areas: [] as Events.EventRelations["areas"],
        events: [] as Events.SearchEvent.SearchEvent[],
      };

      const searchEvent = createEvent(EVENT_TYPES.UNCATEGORIZED, {
        actors: [],
        groups: [],
        groupsMembers: [],
      });
      // title must be at event level for toSearchEvent to include it
      (searchEvent as Events.SearchEvent.SearchEvent).title = "Test Event";

      const update = {
        actors: [createActor("actor-1")],
        groups: [],
        groupsMembers: [],
        media: [],
        keywords: [],
        links: [],
        events: {
          data: [searchEvent],
          total: 1,
          totals: {} as Events.SearchEvent.EventTotals.EventTotals,
        },
      };

      const result = updateCache(existingCache, update);

      expect(result.events.length).toBe(1);
      expect(result.events[0].title).toBe("Test Event");
    });

    it("should handle empty update", () => {
      const existingCache = {
        actors: [createActor("actor-1")],
        groups: [createGroup("group-1")],
        groupsMembers: [] as Events.EventRelations["groupsMembers"],
        media: [createMedia("media-1")],
        keywords: [createKeyword("keyword-1")],
        links: [createLink("link-1")],
        areas: [] as Events.EventRelations["areas"],
        events: [] as Events.SearchEvent.SearchEvent[],
      };

      const update = {
        actors: [],
        groups: [],
        groupsMembers: [],
        media: [],
        keywords: [],
        links: [],
        events: {
          data: [],
          total: 0,
          totals: {} as Events.SearchEvent.EventTotals.EventTotals,
        },
      };

      const result = updateCache(existingCache, update);

      expect(result.actors.length).toBe(1);
      expect(result.groups.length).toBe(1);
      expect(result.media.length).toBe(1);
      expect(result.keywords.length).toBe(1);
      expect(result.links.length).toBe(1);
    });
  });

  describe("getTotals", () => {
    it("should increment uncategorized count for uncategorized event", () => {
      const eventTotals: Events.SearchEvent.EventTotals.EventTotals = {
        uncategorized: 0,
        scientificStudies: 0,
        transactions: 0,
        patents: 0,
        deaths: 0,
        books: 0,
        documentaries: 0,
        quotes: 0,
      };

      const event = createEvent(EVENT_TYPES.UNCATEGORIZED, {
        title: "Test",
        actors: [],
        groups: [],
        groupsMembers: [],
      });

      const result = getTotals(eventTotals, event);

      expect(result.uncategorized).toBe(1);
    });

    it("should increment scientific studies count", () => {
      const eventTotals: Events.SearchEvent.EventTotals.EventTotals = {
        uncategorized: 0,
        scientificStudies: 0,
        transactions: 0,
        patents: 0,
        deaths: 0,
        books: 0,
        documentaries: 0,
        quotes: 0,
      };

      const event = createEvent(EVENT_TYPES.SCIENTIFIC_STUDY, {
        title: "Test Study",
        url: createUUID("url-1"),
        authors: [createUUID("author-1")],
        publisher: createUUID("publisher-1"),
      });

      const result = getTotals(eventTotals, event);

      expect(result.scientificStudies).toBe(1);
    });

    it("should increment transactions count", () => {
      const eventTotals: Events.SearchEvent.EventTotals.EventTotals = {
        uncategorized: 0,
        scientificStudies: 0,
        transactions: 0,
        patents: 0,
        deaths: 0,
        books: 0,
        documentaries: 0,
        quotes: 0,
      };

      const event = createEvent(EVENT_TYPES.TRANSACTION, {
        from: { type: "Actor", id: createUUID("from") },
        to: { type: "Actor", id: createUUID("to") },
      });

      const result = getTotals(eventTotals, event);

      expect(result.transactions).toBe(1);
    });

    it("should increment patents count", () => {
      const eventTotals: Events.SearchEvent.EventTotals.EventTotals = {
        uncategorized: 0,
        scientificStudies: 0,
        transactions: 0,
        patents: 0,
        deaths: 0,
        books: 0,
        documentaries: 0,
        quotes: 0,
      };

      const event = createEvent(EVENT_TYPES.PATENT, {
        title: "Test Patent",
        source: createUUID("source-1"),
        owners: { actors: [createUUID("owner-1")], groups: [] },
      });

      const result = getTotals(eventTotals, event);

      expect(result.patents).toBe(1);
    });

    it("should increment deaths count", () => {
      const eventTotals: Events.SearchEvent.EventTotals.EventTotals = {
        uncategorized: 0,
        scientificStudies: 0,
        transactions: 0,
        patents: 0,
        deaths: 0,
        books: 0,
        documentaries: 0,
        quotes: 0,
      };

      const event = createEvent(EVENT_TYPES.DEATH, {
        victim: createUUID("victim-1"),
        location: undefined,
      });

      const result = getTotals(eventTotals, event);

      expect(result.deaths).toBe(1);
    });

    it("should increment books count", () => {
      const eventTotals: Events.SearchEvent.EventTotals.EventTotals = {
        uncategorized: 0,
        scientificStudies: 0,
        transactions: 0,
        patents: 0,
        deaths: 0,
        books: 0,
        documentaries: 0,
        quotes: 0,
      };

      const event = createEvent(EVENT_TYPES.BOOK, {
        title: "Test Book",
        media: { pdf: createUUID("pdf-1"), audio: undefined },
        authors: [{ type: "Actor", id: createUUID("author-1") }],
        publisher: undefined,
      });

      const result = getTotals(eventTotals, event);

      expect(result.books).toBe(1);
    });

    it("should increment documentaries count", () => {
      const eventTotals: Events.SearchEvent.EventTotals.EventTotals = {
        uncategorized: 0,
        scientificStudies: 0,
        transactions: 0,
        patents: 0,
        deaths: 0,
        books: 0,
        documentaries: 0,
        quotes: 0,
      };

      const event = createEvent(EVENT_TYPES.DOCUMENTARY, {
        title: "Test Documentary",
        media: createUUID("media-1"),
        website: createUUID("website-1"),
        authors: { actors: [createUUID("author-1")], groups: [] },
        subjects: { actors: [], groups: [] },
      });

      const result = getTotals(eventTotals, event);

      expect(result.documentaries).toBe(1);
    });

    it("should increment quotes count", () => {
      const eventTotals: Events.SearchEvent.EventTotals.EventTotals = {
        uncategorized: 0,
        scientificStudies: 0,
        transactions: 0,
        patents: 0,
        deaths: 0,
        books: 0,
        documentaries: 0,
        quotes: 0,
      };

      const event = createEvent(EVENT_TYPES.QUOTE, {
        quote: "Test quote",
        subject: { type: "Actor", id: createUUID("subject-1") },
      });

      const result = getTotals(eventTotals, event);

      expect(result.quotes).toBe(1);
    });

    it("should not increment counts for non-matching event types", () => {
      const eventTotals: Events.SearchEvent.EventTotals.EventTotals = {
        uncategorized: 0,
        scientificStudies: 0,
        transactions: 0,
        patents: 0,
        deaths: 0,
        books: 0,
        documentaries: 0,
        quotes: 0,
      };

      const event = createEvent(EVENT_TYPES.UNCATEGORIZED, {
        title: "Test",
        actors: [],
        groups: [],
        groupsMembers: [],
      });

      const result = getTotals(eventTotals, event);

      expect(result.scientificStudies).toBe(0);
      expect(result.transactions).toBe(0);
      expect(result.patents).toBe(0);
      expect(result.deaths).toBe(0);
      expect(result.books).toBe(0);
      expect(result.documentaries).toBe(0);
      expect(result.quotes).toBe(0);
    });

    it("should accumulate totals across multiple events", () => {
      let eventTotals: Events.SearchEvent.EventTotals.EventTotals = {
        uncategorized: 0,
        scientificStudies: 0,
        transactions: 0,
        patents: 0,
        deaths: 0,
        books: 0,
        documentaries: 0,
        quotes: 0,
      };

      const uncategorizedEvent = createEvent(EVENT_TYPES.UNCATEGORIZED, {
        title: "Event 1",
        actors: [],
        groups: [],
        groupsMembers: [],
      });

      const deathEvent = createEvent(EVENT_TYPES.DEATH, {
        victim: createUUID("victim-1"),
        location: undefined,
      });

      const quoteEvent = createEvent(EVENT_TYPES.QUOTE, {
        quote: "Test quote",
        subject: { type: "Actor", id: createUUID("subject-1") },
      });

      eventTotals = getTotals(eventTotals, uncategorizedEvent);
      eventTotals = getTotals(eventTotals, deathEvent);
      eventTotals = getTotals(eventTotals, quoteEvent);

      expect(eventTotals.uncategorized).toBe(1);
      expect(eventTotals.deaths).toBe(1);
      expect(eventTotals.quotes).toBe(1);
    });

    it("should start from non-zero totals", () => {
      const eventTotals: Events.SearchEvent.EventTotals.EventTotals = {
        uncategorized: 5,
        scientificStudies: 3,
        transactions: 2,
        patents: 1,
        deaths: 0,
        books: 0,
        documentaries: 0,
        quotes: 0,
      };

      const event = createEvent(EVENT_TYPES.UNCATEGORIZED, {
        title: "Test",
        actors: [],
        groups: [],
        groupsMembers: [],
      });

      const result = getTotals(eventTotals, event);

      expect(result.uncategorized).toBe(6);
      expect(result.scientificStudies).toBe(3);
    });
  });
});
