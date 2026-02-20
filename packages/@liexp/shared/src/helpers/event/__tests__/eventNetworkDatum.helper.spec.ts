import { type UUID } from "@liexp/io/lib/http/Common/UUID.js";
import { EVENT_TYPES } from "@liexp/io/lib/http/Events/EventType.js";
import * as Events from "@liexp/io/lib/http/Events/index.js";
import * as Media from "@liexp/io/lib/http/Media/index.js";
import { describe, expect, it } from "vitest";
import { toEventNetworkDatum } from "../eventNetworkDatum.helper.js";

const createUUID = (id: string): UUID => id as UUID;

const createSearchEvent = (
  type: Events.EventType,
  payload: Record<string, unknown>,
  overrides: Partial<Events.SearchEvent.SearchEvent> = {},
): Events.SearchEvent.SearchEvent =>
  ({
    id: createUUID("event-1"),
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
  }) as Events.SearchEvent.SearchEvent;

const createSearchMedia = (id: string): Media.Media =>
  ({
    id: createUUID(id),
    type: "image/png",
    location: `http://media.com/${id}`,
    thumbnail: `http://media.com/${id}/thumb`,
  }) as Media.Media;

describe("toEventNetworkDatum", () => {
  describe("basic structure", () => {
    it("should create network datum with correct id", () => {
      const event = createSearchEvent(EVENT_TYPES.UNCATEGORIZED, {
        title: "Test Event",
        actors: [],
        groups: [],
        groupsMembers: [],
      });

      const result = toEventNetworkDatum(event);

      expect(result.id).toBe(event.id);
    });

    it("should include event type", () => {
      const event = createSearchEvent(EVENT_TYPES.PATENT, {
        title: "Test Patent",
        owners: { actors: [], groups: [] },
      });

      const result = toEventNetworkDatum(event);

      expect(result.type).toBe(EVENT_TYPES.PATENT);
    });

    it("should include event date", () => {
      const eventDate = new Date("2024-06-15");
      const event = createSearchEvent(
        EVENT_TYPES.UNCATEGORIZED,
        { title: "Test Event", actors: [], groups: [], groupsMembers: [] },
        { date: eventDate },
      );

      const result = toEventNetworkDatum(event);

      expect(result.date).toEqual(eventDate);
    });
  });

  describe("title extraction", () => {
    it("should extract title from uncategorized event", () => {
      const event = createSearchEvent(EVENT_TYPES.UNCATEGORIZED, {
        title: "Uncategorized Event Title",
        actors: [],
        groups: [],
        groupsMembers: [],
      });

      const result = toEventNetworkDatum(event);

      expect(result.title).toBe("Uncategorized Event Title");
      expect(result.label).toBe("Uncategorized Event Title");
    });

    it("should extract title from patent event", () => {
      const event = createSearchEvent(EVENT_TYPES.PATENT, {
        title: "Patent Title",
        owners: { actors: [], groups: [] },
      });

      const result = toEventNetworkDatum(event);

      expect(result.title).toBe("Patent Title");
    });

    it("should extract title from scientific study event", () => {
      const event = createSearchEvent(EVENT_TYPES.SCIENTIFIC_STUDY, {
        title: "Study Title",
        authors: [],
        url: null,
      });

      const result = toEventNetworkDatum(event);

      expect(result.title).toBe("Study Title");
    });
  });

  describe("media thumbnail", () => {
    it("should use first media thumbnail as image", () => {
      const media = createSearchMedia("media-1");
      const event = createSearchEvent(
        EVENT_TYPES.UNCATEGORIZED,
        { title: "Test Event", actors: [], groups: [], groupsMembers: [] },
        { media: [media] },
      );

      const result = toEventNetworkDatum(event);

      expect(result.image).toBe("http://media.com/media-1/thumb");
    });

    it("should be undefined when no media", () => {
      const event = createSearchEvent(EVENT_TYPES.UNCATEGORIZED, {
        title: "Test Event",
        actors: [],
        groups: [],
        groupsMembers: [],
      });

      const result = toEventNetworkDatum(event);

      expect(result.image).toBeUndefined();
    });
  });

  describe("default values", () => {
    it("should have transparent colors", () => {
      const event = createSearchEvent(EVENT_TYPES.UNCATEGORIZED, {
        title: "Test Event",
        actors: [],
        groups: [],
        groupsMembers: [],
      });

      const result = toEventNetworkDatum(event);

      expect(result.innerColor).toBe("transparent");
      expect(result.outerColor).toBe("transparent");
    });

    it("should have empty groupBy array", () => {
      const event = createSearchEvent(EVENT_TYPES.UNCATEGORIZED, {
        title: "Test Event",
        actors: [],
        groups: [],
        groupsMembers: [],
      });

      const result = toEventNetworkDatum(event);

      expect(result.groupBy).toEqual([]);
    });

    it("should have empty actors array", () => {
      const event = createSearchEvent(EVENT_TYPES.UNCATEGORIZED, {
        title: "Test Event",
        actors: [],
        groups: [],
        groupsMembers: [],
      });

      const result = toEventNetworkDatum(event);

      expect(result.actors).toEqual([]);
    });

    it("should have empty groups array", () => {
      const event = createSearchEvent(EVENT_TYPES.UNCATEGORIZED, {
        title: "Test Event",
        actors: [],
        groups: [],
        groupsMembers: [],
      });

      const result = toEventNetworkDatum(event);

      expect(result.groups).toEqual([]);
    });

    it("should have empty keywords array", () => {
      const event = createSearchEvent(EVENT_TYPES.UNCATEGORIZED, {
        title: "Test Event",
        actors: [],
        groups: [],
        groupsMembers: [],
      });

      const result = toEventNetworkDatum(event);

      expect(result.keywords).toEqual([]);
    });

    it("should have selected as false", () => {
      const event = createSearchEvent(EVENT_TYPES.UNCATEGORIZED, {
        title: "Test Event",
        actors: [],
        groups: [],
        groupsMembers: [],
      });

      const result = toEventNetworkDatum(event);

      expect(result.selected).toBe(false);
    });
  });
});
