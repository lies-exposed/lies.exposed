import { describe, expect, it } from "vitest";
import { type UUID } from "../../../io/http/Common/UUID.js";
import { EVENT_TYPES } from "../../../io/http/Events/EventType.js";
import {
  type Events,
  type Actor,
  type Group,
  type Media,
  type Link,
  type Keyword,
} from "../../../io/http/index.js";
import { getSearchEventRelations } from "../getSearchEventRelations.js";

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

const createMedia = (id: string): Media.Media =>
  ({
    id: createUUID(id),
    type: "image/png",
    location: `http://media.com/${id}`,
    thumbnail: `http://media.com/${id}/thumb`,
  }) as Media.Media;

const createLink = (id: string): Link.Link =>
  ({
    id: createUUID(id),
    title: `Link ${id}`,
    url: `http://link.com/${id}`,
  }) as Link.Link;

const createKeyword = (id: string): Keyword.Keyword =>
  ({
    id: createUUID(id),
    tag: `keyword-${id}`,
  }) as Keyword.Keyword;

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

describe("getSearchEventRelations", () => {
  describe("common relations", () => {
    it("should extract media, keywords, and links from base event", () => {
      const media = [createMedia("media-1"), createMedia("media-2")];
      const keywords = [createKeyword("kw-1")];
      const links = [createLink("link-1")];

      const event = createSearchEvent(
        EVENT_TYPES.UNCATEGORIZED,
        { title: "Test Event", actors: [], groups: [], groupsMembers: [] },
        { media, keywords, links },
      );

      const result = getSearchEventRelations(event);

      expect(result.media).toEqual(media);
      expect(result.keywords).toEqual(keywords);
      expect(result.links).toEqual(links);
    });
  });

  describe("Book events", () => {
    it("should extract actor authors", () => {
      const actor = createActor("author-1", "Author Name");
      const pdfMedia = createMedia("pdf-1");
      const audioMedia = createMedia("audio-1");

      const event = createSearchEvent(EVENT_TYPES.BOOK, {
        title: "Test Book",
        authors: [{ type: "Actor", id: actor }],
        publisher: undefined,
        media: { pdf: pdfMedia, audio: audioMedia },
      });

      const result = getSearchEventRelations(event);

      // For SearchEvent, authors contain full Actor objects in the id field
      expect(result.actors).toContain(actor);
    });

    it("should extract group authors", () => {
      const group = createGroup("author-group", "Publisher Group");
      const pdfMedia = createMedia("pdf-1");

      const event = createSearchEvent(EVENT_TYPES.BOOK, {
        title: "Test Book",
        authors: [{ type: "Group", id: group }],
        publisher: undefined,
        media: { pdf: pdfMedia, audio: undefined },
      });

      const result = getSearchEventRelations(event);

      expect(result.groups).toContain(group);
    });

    it("should extract actor publisher", () => {
      const publisher = createActor("publisher-1", "Publisher Name");
      const pdfMedia = createMedia("pdf-1");

      const event = createSearchEvent(EVENT_TYPES.BOOK, {
        title: "Test Book",
        authors: [],
        publisher: { type: "Actor", id: publisher },
        media: { pdf: pdfMedia, audio: undefined },
      });

      const result = getSearchEventRelations(event);

      expect(result.actors).toContain(publisher);
    });

    it("should extract group publisher", () => {
      const publisher = createGroup("publisher-group", "Publisher Group");
      const pdfMedia = createMedia("pdf-1");

      const event = createSearchEvent(EVENT_TYPES.BOOK, {
        title: "Test Book",
        authors: [],
        publisher: { type: "Group", id: publisher },
        media: { pdf: pdfMedia, audio: undefined },
      });

      const result = getSearchEventRelations(event);

      expect(result.groups).toContain(publisher);
    });

    it("should extract book media (pdf and audio)", () => {
      const pdfMedia = createMedia("pdf-1");
      const audioMedia = createMedia("audio-1");

      const event = createSearchEvent(EVENT_TYPES.BOOK, {
        title: "Test Book",
        authors: [],
        publisher: undefined,
        media: { pdf: pdfMedia, audio: audioMedia },
      });

      const result = getSearchEventRelations(event);

      expect(result.media).toContain(pdfMedia);
      expect(result.media).toContain(audioMedia);
    });
  });

  describe("Death events", () => {
    it("should extract victim actor", () => {
      const victim = createActor("victim-1", "Victim Name");

      const event = createSearchEvent(EVENT_TYPES.DEATH, {
        victim,
        location: undefined,
      });

      const result = getSearchEventRelations(event);

      expect(result.actors).toContain(victim);
    });

    it("should handle missing victim", () => {
      const event = createSearchEvent(EVENT_TYPES.DEATH, {
        victim: undefined,
        location: undefined,
      });

      const result = getSearchEventRelations(event);

      expect(result.actors).toHaveLength(0);
    });
  });

  describe("Transaction events", () => {
    it("should extract actor from and to", () => {
      const fromActor = createActor("from-1", "From Actor");
      const toActor = createActor("to-1", "To Actor");

      const event = createSearchEvent(EVENT_TYPES.TRANSACTION, {
        title: "Test Transaction",
        from: { type: "Actor", id: fromActor },
        to: { type: "Actor", id: toActor },
      });

      const result = getSearchEventRelations(event);

      expect(result.actors).toContain(fromActor);
      expect(result.actors).toContain(toActor);
    });

    it("should extract group from and to", () => {
      const fromGroup = createGroup("from-1", "From Group");
      const toGroup = createGroup("to-1", "To Group");

      const event = createSearchEvent(EVENT_TYPES.TRANSACTION, {
        title: "Test Transaction",
        from: { type: "Group", id: fromGroup },
        to: { type: "Group", id: toGroup },
      });

      const result = getSearchEventRelations(event);

      expect(result.groups).toContain(fromGroup);
      expect(result.groups).toContain(toGroup);
    });
  });

  describe("Patent events", () => {
    it("should extract owners actors and groups", () => {
      const actors = [
        createActor("owner-1", "Owner 1"),
        createActor("owner-2", "Owner 2"),
      ];
      const groups = [createGroup("owner-group-1", "Owner Group")];

      const event = createSearchEvent(EVENT_TYPES.PATENT, {
        title: "Test Patent",
        owners: { actors, groups },
      });

      const result = getSearchEventRelations(event);

      expect(result.actors).toEqual(actors);
      expect(result.groups).toEqual(groups);
    });
  });

  describe("Documentary events", () => {
    it("should extract authors and subjects", () => {
      const authorActors = [createActor("author-1", "Author")];
      const authorGroups = [createGroup("author-group", "Author Group")];
      const subjectActors = [createActor("subject-1", "Subject")];
      const subjectGroups = [createGroup("subject-group", "Subject Group")];
      const docMedia = createMedia("doc-media");

      const event = createSearchEvent(EVENT_TYPES.DOCUMENTARY, {
        title: "Test Documentary",
        media: docMedia,
        website: null,
        authors: { actors: authorActors, groups: authorGroups },
        subjects: { actors: subjectActors, groups: subjectGroups },
      });

      const result = getSearchEventRelations(event);

      expect(result.actors).toContain(authorActors[0]);
      expect(result.actors).toContain(subjectActors[0]);
      expect(result.groups).toContain(authorGroups[0]);
      expect(result.groups).toContain(subjectGroups[0]);
    });

    it("should include documentary media in relations", () => {
      const docMedia = createMedia("doc-media");

      const event = createSearchEvent(EVENT_TYPES.DOCUMENTARY, {
        title: "Test Documentary",
        media: docMedia,
        website: null,
        authors: { actors: [], groups: [] },
        subjects: { actors: [], groups: [] },
      });

      const result = getSearchEventRelations(event);

      expect(result.media).toContain(docMedia);
    });
  });

  describe("ScientificStudy events", () => {
    it("should extract authors and publisher", () => {
      const authors = [
        createActor("author-1", "Author 1"),
        createActor("author-2", "Author 2"),
      ];
      const publisher = createGroup("publisher", "Publisher");

      const event = createSearchEvent(EVENT_TYPES.SCIENTIFIC_STUDY, {
        title: "Test Study",
        url: null,
        authors,
        publisher,
      });

      const result = getSearchEventRelations(event);

      expect(result.actors).toEqual(authors);
      expect(result.groups).toContain(publisher);
    });

    it("should handle missing publisher", () => {
      const authors = [createActor("author-1", "Author 1")];

      const event = createSearchEvent(EVENT_TYPES.SCIENTIFIC_STUDY, {
        title: "Test Study",
        url: null,
        authors,
        publisher: undefined,
      });

      const result = getSearchEventRelations(event);

      expect(result.groups).toHaveLength(0);
    });
  });

  describe("Quote events", () => {
    it("should extract actor subject", () => {
      const actor = createActor("subject-1", "Subject Actor");

      const event = createSearchEvent(EVENT_TYPES.QUOTE, {
        quote: "Test quote",
        subject: { type: "Actor", id: actor },
      });

      const result = getSearchEventRelations(event);

      expect(result.actors).toContain(actor);
      expect(result.groups).toHaveLength(0);
    });

    it("should extract group subject", () => {
      const group = createGroup("subject-1", "Subject Group");

      const event = createSearchEvent(EVENT_TYPES.QUOTE, {
        quote: "Test quote",
        subject: { type: "Group", id: group },
      });

      const result = getSearchEventRelations(event);

      expect(result.groups).toContain(group);
      expect(result.actors).toHaveLength(0);
    });
  });

  describe("Uncategorized events", () => {
    it("should extract actors, groups, and groupsMembers", () => {
      const actors = [createActor("actor-1", "Actor 1")];
      const groups = [createGroup("group-1", "Group 1")];
      const groupsMembers = [createActor("member-1", "Member 1")];

      const event = createSearchEvent(EVENT_TYPES.UNCATEGORIZED, {
        title: "Test Event",
        actors,
        groups,
        groupsMembers,
      });

      const result = getSearchEventRelations(event);

      expect(result.actors).toEqual(actors);
      expect(result.groups).toEqual(groups);
      expect(result.groupsMembers).toEqual(groupsMembers);
    });
  });
});
