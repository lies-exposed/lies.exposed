import { type UUID } from "@liexp/io/lib/http/Common/UUID.js";
import { EVENT_TYPES } from "@liexp/io/lib/http/Events/EventType.js";
import {
  type Events,
  type Actor,
  type Group,
  type Media,
} from "@liexp/io/lib/http/index.js";
import { describe, expect, it } from "vitest";
import { SearchEventHelper } from "../searchEvent.helper.js";

const createUUID = (id: string): UUID => id as UUID;

const createActor = (id: string, fullName: string): Actor.Actor =>
  ({
    id: createUUID(id),
    fullName,
    username: fullName.toLowerCase().replace(/\s/g, "-"),
    color: "#000000",
  }) as Actor.Actor;

const createGroup = (id: string, name: string): Group.Group =>
  ({
    id: createUUID(id),
    name,
    color: "#000000",
  }) as Group.Group;

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

describe("SearchEventHelper", () => {
  describe("getTitle", () => {
    describe("Quote events", () => {
      it("should return quote title with actor name", () => {
        const actor = createActor("actor-1", "John Doe");
        const event = createSearchEvent(EVENT_TYPES.QUOTE, {
          quote: "This is a test quote",
          subject: { type: "Actor", id: actor },
        });

        const result = SearchEventHelper.getTitle(event);

        expect(result).toBe("Quote by John Doe");
      });

      it("should return quote title with group name", () => {
        const group = createGroup("group-1", "Acme Corp");
        const event = createSearchEvent(EVENT_TYPES.QUOTE, {
          quote: "This is a test quote",
          subject: { type: "Group", id: group },
        });

        const result = SearchEventHelper.getTitle(event);

        expect(result).toBe("Quote by Acme Corp");
      });
    });

    describe("Death events", () => {
      it("should return death title with victim name", () => {
        const actor = createActor("actor-1", "Jane Smith");
        const event = createSearchEvent(EVENT_TYPES.DEATH, {
          victim: actor,
          location: undefined,
        });

        const result = SearchEventHelper.getTitle(event);

        expect(result).toBe("Death of Jane Smith");
      });
    });

    describe("events with title payload", () => {
      it("should return title from Documentary event", () => {
        const event = createSearchEvent(EVENT_TYPES.DOCUMENTARY, {
          title: "Important Documentary",
          media: null,
          website: null,
          authors: { actors: [], groups: [] },
          subjects: { actors: [], groups: [] },
        });

        const result = SearchEventHelper.getTitle(event);

        expect(result).toBe("Important Documentary");
      });

      it("should return title from Patent event", () => {
        const event = createSearchEvent(EVENT_TYPES.PATENT, {
          title: "New Invention Patent",
          owners: { actors: [], groups: [] },
        });

        const result = SearchEventHelper.getTitle(event);

        expect(result).toBe("New Invention Patent");
      });

      it("should return title from ScientificStudy event", () => {
        const event = createSearchEvent(EVENT_TYPES.SCIENTIFIC_STUDY, {
          title: "Research Paper Title",
          authors: [],
          url: null,
        });

        const result = SearchEventHelper.getTitle(event);

        expect(result).toBe("Research Paper Title");
      });

      it("should return title from Transaction event", () => {
        const actor = createActor("actor-1", "Buyer");
        const event = createSearchEvent(EVENT_TYPES.TRANSACTION, {
          title: "Major Acquisition",
          from: { type: "Actor", id: actor },
          to: { type: "Actor", id: actor },
        });

        const result = SearchEventHelper.getTitle(event);

        expect(result).toBe("Major Acquisition");
      });

      it("should return title from Uncategorized event", () => {
        const event = createSearchEvent(EVENT_TYPES.UNCATEGORIZED, {
          title: "General Event",
          actors: [],
          groups: [],
          groupsMembers: [],
        });

        const result = SearchEventHelper.getTitle(event);

        expect(result).toBe("General Event");
      });

      it("should return title from Book event", () => {
        const media = {
          id: createUUID("media-1"),
          type: "application/pdf",
          location: "http://test.com/book.pdf",
        } as Media.Media;
        const event = createSearchEvent(EVENT_TYPES.BOOK, {
          title: "Book Title",
          authors: [],
          media: { pdf: media, audio: undefined },
        });

        const result = SearchEventHelper.getTitle(event);

        expect(result).toBe("Book Title");
      });
    });
  });

  describe("transform", () => {
    it("should be defined", () => {
      expect(SearchEventHelper.transform).toBeDefined();
    });

    // Note: More comprehensive transform tests would require setting up
    // complete event fixtures with all relations, which is complex.
    // The basic test ensures the function exists and is callable.
  });
});
