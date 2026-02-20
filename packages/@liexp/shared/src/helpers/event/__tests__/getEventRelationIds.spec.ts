import { type UUID } from "@liexp/io/lib/http/Common/UUID.js";
import { EVENT_TYPES } from "@liexp/io/lib/http/Events/EventType.js";
import type * as Events from "@liexp/io/lib/http/Events/index.js";
import { describe, expect, it } from "vitest";
import {
  getRelationIds,
  getRelationIdsFromEventRelations,
} from "../getEventRelationIds.js";

// Use valid UUID format for tests since Schema.is(UUID) is used for filtering
// UUID v4 format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx (8-4-4-4-12 hex chars)
const uuidCache = new Map<string, UUID>();
const createUUID = (id: string): UUID => {
  if (uuidCache.has(id)) {
    return uuidCache.get(id)!;
  }
  // Create a deterministic but valid UUID based on the id using a simple hash
  const hash = id
    .split("")
    .reduce((acc, char, i) => acc + char.charCodeAt(0) * (i + 1), 0);
  const hex = hash.toString(16).padStart(12, "0").slice(0, 12);
  const uuid =
    `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4000-8000-000000000000` as UUID;
  uuidCache.set(id, uuid);
  return uuid;
};

const createBaseEvent = (
  type: Events.EventType,
  payload: Record<string, unknown>,
): Events.Event =>
  ({
    id: createUUID("event-1"),
    type,
    date: new Date(),
    draft: false,
    media: [createUUID("media-1"), createUUID("media-2")],
    keywords: [createUUID("keyword-1")],
    links: [createUUID("link-1")],
    socialPosts: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    payload,
  }) as Events.Event;

describe("getRelationIds", () => {
  describe("Book events", () => {
    it("should extract actor authors and publisher", () => {
      const event = createBaseEvent(EVENT_TYPES.BOOK, {
        title: "Test Book",
        authors: [
          { type: "Actor", id: createUUID("author-1") },
          { type: "Group", id: createUUID("group-author-1") },
        ],
        publisher: { type: "Actor", id: createUUID("publisher-1") },
        media: {
          pdf: createUUID("pdf-media"),
          audio: createUUID("audio-media"),
        },
      });

      const result = getRelationIds(event);

      expect(result.actors).toContain(createUUID("author-1"));
      expect(result.actors).toContain(createUUID("publisher-1"));
      expect(result.groups).toContain(createUUID("group-author-1"));
      expect(result.media).toContain(createUUID("pdf-media"));
      expect(result.media).toContain(createUUID("audio-media"));
    });

    it("should handle group publisher", () => {
      const event = createBaseEvent(EVENT_TYPES.BOOK, {
        title: "Test Book",
        authors: [{ type: "Actor", id: createUUID("author-1") }],
        publisher: { type: "Group", id: createUUID("publisher-group") },
        media: { pdf: createUUID("pdf-media"), audio: undefined },
      });

      const result = getRelationIds(event);

      expect(result.groups).toContain(createUUID("publisher-group"));
    });
  });

  describe("Quote events", () => {
    it("should extract actor subject", () => {
      const event = createBaseEvent(EVENT_TYPES.QUOTE, {
        quote: "Test quote",
        subject: { type: "Actor", id: createUUID("subject-actor") },
      });

      const result = getRelationIds(event);

      expect(result.actors).toContain(createUUID("subject-actor"));
      expect(result.groups).toHaveLength(0);
    });

    it("should extract group subject", () => {
      const event = createBaseEvent(EVENT_TYPES.QUOTE, {
        quote: "Test quote",
        subject: { type: "Group", id: createUUID("subject-group") },
      });

      const result = getRelationIds(event);

      expect(result.groups).toContain(createUUID("subject-group"));
      expect(result.actors).toHaveLength(0);
    });

    it("should handle undefined subject", () => {
      const event = createBaseEvent(EVENT_TYPES.QUOTE, {
        quote: "Test quote",
        subject: undefined,
      });

      const result = getRelationIds(event);

      expect(result.actors).toHaveLength(0);
      expect(result.groups).toHaveLength(0);
    });
  });

  describe("Death events", () => {
    it("should extract victim actor", () => {
      const event = createBaseEvent(EVENT_TYPES.DEATH, {
        victim: createUUID("victim-actor"),
        location: undefined,
      });

      const result = getRelationIds(event);

      expect(result.actors).toContain(createUUID("victim-actor"));
      expect(result.actors).toHaveLength(1);
      expect(result.groups).toHaveLength(0);
    });
  });

  describe("Transaction events", () => {
    it("should extract actors from from and to", () => {
      const event = createBaseEvent(EVENT_TYPES.TRANSACTION, {
        title: "Test Transaction",
        from: { type: "Actor", id: createUUID("from-actor") },
        to: { type: "Actor", id: createUUID("to-actor") },
      });

      const result = getRelationIds(event);

      expect(result.actors).toContain(createUUID("from-actor"));
      expect(result.actors).toContain(createUUID("to-actor"));
      expect(result.actors).toHaveLength(2);
    });

    it("should extract groups from from and to", () => {
      const event = createBaseEvent(EVENT_TYPES.TRANSACTION, {
        title: "Test Transaction",
        from: { type: "Group", id: createUUID("from-group") },
        to: { type: "Group", id: createUUID("to-group") },
      });

      const result = getRelationIds(event);

      expect(result.groups).toContain(createUUID("from-group"));
      expect(result.groups).toContain(createUUID("to-group"));
      expect(result.actors).toHaveLength(0);
    });

    it("should handle mixed actor and group", () => {
      const event = createBaseEvent(EVENT_TYPES.TRANSACTION, {
        title: "Test Transaction",
        from: { type: "Actor", id: createUUID("from-actor") },
        to: { type: "Group", id: createUUID("to-group") },
      });

      const result = getRelationIds(event);

      expect(result.actors).toContain(createUUID("from-actor"));
      expect(result.groups).toContain(createUUID("to-group"));
    });
  });

  describe("Patent events", () => {
    it("should extract owners actors and groups", () => {
      const event = createBaseEvent(EVENT_TYPES.PATENT, {
        title: "Test Patent",
        owners: {
          actors: [createUUID("owner-actor-1"), createUUID("owner-actor-2")],
          groups: [createUUID("owner-group-1")],
        },
      });

      const result = getRelationIds(event);

      expect(result.actors).toContain(createUUID("owner-actor-1"));
      expect(result.actors).toContain(createUUID("owner-actor-2"));
      expect(result.groups).toContain(createUUID("owner-group-1"));
    });
  });

  describe("Documentary events", () => {
    it("should extract authors and subjects actors and groups", () => {
      const event = createBaseEvent(EVENT_TYPES.DOCUMENTARY, {
        title: "Test Documentary",
        media: createUUID("doc-media"),
        website: createUUID("website-link"),
        authors: {
          actors: [createUUID("author-actor")],
          groups: [createUUID("author-group")],
        },
        subjects: {
          actors: [createUUID("subject-actor")],
          groups: [createUUID("subject-group")],
        },
      });

      const result = getRelationIds(event);

      expect(result.actors).toContain(createUUID("author-actor"));
      expect(result.actors).toContain(createUUID("subject-actor"));
      expect(result.groups).toContain(createUUID("author-group"));
      expect(result.groups).toContain(createUUID("subject-group"));
      expect(result.media).toContain(createUUID("doc-media"));
      expect(result.links).toContain(createUUID("website-link"));
    });
  });

  describe("ScientificStudy events", () => {
    it("should extract authors and publisher", () => {
      const event = createBaseEvent(EVENT_TYPES.SCIENTIFIC_STUDY, {
        title: "Test Study",
        url: createUUID("url-link"),
        authors: [createUUID("author-1"), createUUID("author-2")],
        publisher: createUUID("publisher-group"),
      });

      const result = getRelationIds(event);

      expect(result.actors).toContain(createUUID("author-1"));
      expect(result.actors).toContain(createUUID("author-2"));
      expect(result.groups).toContain(createUUID("publisher-group"));
      expect(result.links).toContain(createUUID("url-link"));
    });

    it("should handle missing publisher", () => {
      const event = createBaseEvent(EVENT_TYPES.SCIENTIFIC_STUDY, {
        title: "Test Study",
        url: createUUID("url-link"),
        authors: [createUUID("author-1")],
        publisher: undefined,
      });

      const result = getRelationIds(event);

      expect(result.groups).toHaveLength(0);
    });
  });

  describe("Uncategorized events", () => {
    it("should extract actors, groups, and groupsMembers", () => {
      const event = createBaseEvent(EVENT_TYPES.UNCATEGORIZED, {
        title: "Test Event",
        actors: [createUUID("actor-1"), createUUID("actor-2")],
        groups: [createUUID("group-1")],
        groupsMembers: [createUUID("member-1")],
      });

      const result = getRelationIds(event);

      expect(result.actors).toContain(createUUID("actor-1"));
      expect(result.actors).toContain(createUUID("actor-2"));
      expect(result.groups).toContain(createUUID("group-1"));
      expect(result.groupsMembers).toContain(createUUID("member-1"));
    });
  });

  describe("common properties", () => {
    it("should include media, keywords, and links from base event", () => {
      const event = createBaseEvent(EVENT_TYPES.UNCATEGORIZED, {
        title: "Test Event",
        actors: [],
        groups: [],
        groupsMembers: [],
      });

      const result = getRelationIds(event);

      expect(result.media).toContain(createUUID("media-1"));
      expect(result.media).toContain(createUUID("media-2"));
      expect(result.keywords).toContain(createUUID("keyword-1"));
      expect(result.links).toContain(createUUID("link-1"));
    });
  });
});

describe("getRelationIdsFromEventRelations", () => {
  it("should extract IDs from event relations", () => {
    const relations: Events.EventRelations = {
      actors: [
        { id: createUUID("actor-1"), fullName: "Actor 1" },
      ] as Events.EventRelations["actors"],
      groups: [
        { id: createUUID("group-1"), name: "Group 1" },
      ] as Events.EventRelations["groups"],
      groupsMembers: [
        { id: createUUID("member-1") },
      ] as Events.EventRelations["groupsMembers"],
      keywords: [
        { id: createUUID("keyword-1"), tag: "keyword" },
      ] as Events.EventRelations["keywords"],
      links: [
        { id: createUUID("link-1"), url: "http://test.com" },
      ] as Events.EventRelations["links"],
      media: [
        { id: createUUID("media-1"), location: "http://media.com" },
      ] as Events.EventRelations["media"],
      areas: [
        { id: createUUID("area-1"), label: "Area 1" },
      ] as Events.EventRelations["areas"],
    };

    const result = getRelationIdsFromEventRelations(relations);

    expect(result.actors).toEqual([createUUID("actor-1")]);
    expect(result.groups).toEqual([createUUID("group-1")]);
    expect(result.groupsMembers).toEqual([createUUID("member-1")]);
    expect(result.keywords).toEqual([createUUID("keyword-1")]);
    expect(result.links).toEqual([createUUID("link-1")]);
    expect(result.media).toEqual([createUUID("media-1")]);
    expect(result.areas).toEqual([createUUID("area-1")]);
  });

  it("should handle empty relations", () => {
    const relations: Events.EventRelations = {
      actors: [],
      groups: [],
      groupsMembers: [],
      keywords: [],
      links: [],
      media: [],
      areas: [],
    };

    const result = getRelationIdsFromEventRelations(relations);

    expect(result.actors).toEqual([]);
    expect(result.groups).toEqual([]);
    expect(result.groupsMembers).toEqual([]);
    expect(result.keywords).toEqual([]);
    expect(result.links).toEqual([]);
    expect(result.media).toEqual([]);
    expect(result.areas).toEqual([]);
  });
});
