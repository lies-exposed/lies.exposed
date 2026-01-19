import { subDays } from "date-fns";
import * as fc from "fast-check";
import { describe, expect, test } from "vitest";
import { mock } from "vitest-mock-extended";
import { type Actor } from "../../../io/http/Actor.js";
import { type BlockNoteDocument } from "../../../io/http/Common/BlockNoteDocument.js";
import { type UUID } from "../../../io/http/Common/UUID.js";
import { type Documentary } from "../../../io/http/Events/Documentary.js";
import { EVENT_TYPES } from "../../../io/http/Events/EventType";
import { type Patent } from "../../../io/http/Events/Patent.js";
import { type ScientificStudy } from "../../../io/http/Events/ScientificStudy.js";
import { type Uncategorized } from "../../../io/http/Events/Uncategorized.js";
import { type EventRelations } from "../../../io/http/Events/index.js";
import { type Group } from "../../../io/http/Group.js";
import { type GroupMember } from "../../../io/http/GroupMember.js";
import { toInitialValue } from "../../../providers/blocknote/utils.js";
import { MergeEventsHelper, getUniqueIds } from "../merge-event.helper";

const createRelations = (
  overrides?: Partial<EventRelations>,
): EventRelations => ({
  groups: [],
  actors: [],
  media: [],
  keywords: [],
  links: [],
  areas: [],
  groupsMembers: [],
  ...overrides,
});

const createBaseEventProps = () => ({
  draft: false,
  excerpt: toInitialValue("Test excerpt"),
  body: null,
  links: [],
  media: [],
  keywords: [],
  socialPosts: [],
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: undefined,
});

describe("MergeEventsHelper", () => {
  describe(getUniqueIds.name, () => {
    test("Should return empty array for null input", () => {
      expect(getUniqueIds(null)).toEqual([]);
    });

    test("Should return empty array for undefined input", () => {
      expect(getUniqueIds(undefined)).toEqual([]);
    });

    test("Should extract IDs from UUID strings", () => {
      const ids = fc.sample(fc.uuid(), 3) as UUID[];
      expect(getUniqueIds(ids)).toEqual(ids);
    });

    test("Should extract IDs from objects with id property", () => {
      const ids = fc.sample(fc.uuid(), 3) as UUID[];
      const items = ids.map((id) => ({ id, name: "test" }));
      expect(getUniqueIds(items)).toEqual(ids);
    });

    test("Should deduplicate IDs", () => {
      const id1 = fc.sample(fc.uuid(), 1)[0] as UUID;
      const id2 = fc.sample(fc.uuid(), 1)[0] as UUID;
      expect(getUniqueIds([id1, id2, id1, id2])).toEqual([id1, id2]);
    });

    test("Should handle mixed UUID strings and objects", () => {
      const id1 = fc.sample(fc.uuid(), 1)[0] as UUID;
      const id2 = fc.sample(fc.uuid(), 1)[0] as UUID;
      const items: (UUID | { id: UUID })[] = [id1, { id: id2 }];
      expect(getUniqueIds(items)).toEqual([id1, id2]);
    });
  });

  describe(MergeEventsHelper.mergeEvents.name, () => {
    test("Should return single event unchanged when only one event provided", () => {
      const eventId = fc.sample(fc.uuid(), 1)[0] as UUID;
      const event: Uncategorized = {
        id: eventId,
        type: EVENT_TYPES.UNCATEGORIZED,
        date: new Date("2020-01-01"),
        payload: {
          title: "Single event",
          location: undefined,
          endDate: undefined,
          actors: [],
          groups: [],
          groupsMembers: [],
        },
        ...createBaseEventProps(),
      };

      const result = MergeEventsHelper.mergeEvents(
        [event],
        EVENT_TYPES.UNCATEGORIZED,
        createRelations(),
      );

      expect(result).toBe(event);
    });

    test("Should preserve target event order based on first ID", () => {
      const targetId = fc.sample(fc.uuid(), 1)[0] as UUID;
      const sourceId = fc.sample(fc.uuid(), 1)[0] as UUID;

      const targetEvent: Uncategorized = {
        id: targetId,
        type: EVENT_TYPES.UNCATEGORIZED,
        date: new Date("2020-01-01"),
        payload: {
          title: "happy title",
          location: undefined,
          endDate: undefined,
          actors: [],
          groups: [],
          groupsMembers: [],
        },
        ...createBaseEventProps(),
      };

      const sourceEvent: Uncategorized = {
        id: sourceId,
        type: EVENT_TYPES.UNCATEGORIZED,
        date: new Date("2021-01-01"),
        payload: {
          title: "Source title",
          location: undefined,
          endDate: undefined,
          actors: [],
          groups: [],
          groupsMembers: [],
        },
        ...createBaseEventProps(),
        createdAt: subDays(new Date(), 5),
        updatedAt: subDays(new Date(), 4),
      };

      const result = MergeEventsHelper.mergeEvents(
        [targetEvent, sourceEvent],
        EVENT_TYPES.SCIENTIFIC_STUDY,
        createRelations(),
      );

      expect(result.id).toBe(targetId);
    });

    describe("UNCATEGORIZED event payload merging", () => {
      test("Should merge actors from multiple UNCATEGORIZED events", () => {
        const targetId = fc.sample(fc.uuid(), 1)[0] as UUID;
        const sourceId = fc.sample(fc.uuid(), 1)[0] as UUID;
        const actor1 = fc.sample(fc.uuid(), 1)[0] as UUID;
        const actor2 = fc.sample(fc.uuid(), 1)[0] as UUID;
        const actor3 = fc.sample(fc.uuid(), 1)[0] as UUID;

        const targetEvent: Uncategorized = {
          id: targetId,
          type: EVENT_TYPES.UNCATEGORIZED,
          date: new Date("2020-01-01"),
          payload: {
            title: "Target event",
            location: undefined,
            endDate: undefined,
            actors: [actor1],
            groups: [],
            groupsMembers: [],
          },
          ...createBaseEventProps(),
        };

        const sourceEvent: Uncategorized = {
          id: sourceId,
          type: EVENT_TYPES.UNCATEGORIZED,
          date: new Date("2021-01-01"),
          payload: {
            title: "Source event",
            location: undefined,
            endDate: undefined,
            actors: [actor2, actor3],
            groups: [],
            groupsMembers: [],
          },
          ...createBaseEventProps(),
        };

        const result = MergeEventsHelper.mergeEvents(
          [targetEvent, sourceEvent],
          EVENT_TYPES.UNCATEGORIZED,
          createRelations({
            actors: [
              mock<Actor>({ id: actor1 }),
              mock<Actor>({ id: actor2 }),
              mock<Actor>({ id: actor3 }),
            ],
          }),
        );

        const payload = result.payload as Uncategorized["payload"];
        expect(payload.actors).toEqual([actor1, actor2, actor3]);
      });

      test("Should merge groups from multiple UNCATEGORIZED events", () => {
        const targetId = fc.sample(fc.uuid(), 1)[0] as UUID;
        const sourceId = fc.sample(fc.uuid(), 1)[0] as UUID;
        const group1 = fc.sample(fc.uuid(), 1)[0] as UUID;
        const group2 = fc.sample(fc.uuid(), 1)[0] as UUID;

        const targetEvent: Uncategorized = {
          id: targetId,
          type: EVENT_TYPES.UNCATEGORIZED,
          date: new Date("2020-01-01"),
          payload: {
            title: "Target event",
            location: undefined,
            endDate: undefined,
            actors: [],
            groups: [group1],
            groupsMembers: [],
          },
          ...createBaseEventProps(),
        };

        const sourceEvent: Uncategorized = {
          id: sourceId,
          type: EVENT_TYPES.UNCATEGORIZED,
          date: new Date("2021-01-01"),
          payload: {
            title: "Source event",
            location: undefined,
            endDate: undefined,
            actors: [],
            groups: [group2],
            groupsMembers: [],
          },
          ...createBaseEventProps(),
        };

        const result = MergeEventsHelper.mergeEvents(
          [targetEvent, sourceEvent],
          EVENT_TYPES.UNCATEGORIZED,
          createRelations({
            groups: [mock<Group>({ id: group1 }), mock<Group>({ id: group2 })],
          }),
        );

        const payload = result.payload as Uncategorized["payload"];
        expect(payload.groups).toEqual([group1, group2]);
      });

      test("Should merge groupsMembers from multiple UNCATEGORIZED events", () => {
        const targetId = fc.sample(fc.uuid(), 1)[0] as UUID;
        const sourceId = fc.sample(fc.uuid(), 1)[0] as UUID;
        const member1 = fc.sample(fc.uuid(), 1)[0] as UUID;
        const member2 = fc.sample(fc.uuid(), 1)[0] as UUID;

        const targetEvent: Uncategorized = {
          id: targetId,
          type: EVENT_TYPES.UNCATEGORIZED,
          date: new Date("2020-01-01"),
          payload: {
            title: "Target event",
            location: undefined,
            endDate: undefined,
            actors: [],
            groups: [],
            groupsMembers: [member1],
          },
          ...createBaseEventProps(),
        };

        const sourceEvent: Uncategorized = {
          id: sourceId,
          type: EVENT_TYPES.UNCATEGORIZED,
          date: new Date("2021-01-01"),
          payload: {
            title: "Source event",
            location: undefined,
            endDate: undefined,
            actors: [],
            groups: [],
            groupsMembers: [member2],
          },
          ...createBaseEventProps(),
        };

        const result = MergeEventsHelper.mergeEvents(
          [targetEvent, sourceEvent],
          EVENT_TYPES.UNCATEGORIZED,
          createRelations({
            groupsMembers: [
              mock<GroupMember>({ id: member1 }),
              mock<GroupMember>({ id: member2 }),
            ],
          }),
        );

        const payload = result.payload as Uncategorized["payload"];
        expect(payload.groupsMembers).toEqual([member1, member2]);
      });

      test("Should deduplicate actors when merging UNCATEGORIZED events", () => {
        const targetId = fc.sample(fc.uuid(), 1)[0] as UUID;
        const sourceId = fc.sample(fc.uuid(), 1)[0] as UUID;
        const sharedActor = fc.sample(fc.uuid(), 1)[0] as UUID;
        const uniqueActor = fc.sample(fc.uuid(), 1)[0] as UUID;

        const targetEvent: Uncategorized = {
          id: targetId,
          type: EVENT_TYPES.UNCATEGORIZED,
          date: new Date("2020-01-01"),
          payload: {
            title: "Target event",
            location: undefined,
            endDate: undefined,
            actors: [sharedActor],
            groups: [],
            groupsMembers: [],
          },
          ...createBaseEventProps(),
        };

        const sourceEvent: Uncategorized = {
          id: sourceId,
          type: EVENT_TYPES.UNCATEGORIZED,
          date: new Date("2021-01-01"),
          payload: {
            title: "Source event",
            location: undefined,
            endDate: undefined,
            actors: [sharedActor, uniqueActor],
            groups: [],
            groupsMembers: [],
          },
          ...createBaseEventProps(),
        };

        const result = MergeEventsHelper.mergeEvents(
          [targetEvent, sourceEvent],
          EVENT_TYPES.UNCATEGORIZED,
          createRelations({
            actors: [
              mock<Actor>({ id: sharedActor }),
              mock<Actor>({ id: uniqueActor }),
            ],
          }),
        );

        const payload = result.payload as Uncategorized["payload"];
        expect(payload.actors).toEqual([sharedActor, uniqueActor]);
      });
    });

    describe("DOCUMENTARY event payload merging", () => {
      test("Should merge authors and subjects from DOCUMENTARY events into subjects", () => {
        const targetId = fc.sample(fc.uuid(), 1)[0] as UUID;
        const sourceId = fc.sample(fc.uuid(), 1)[0] as UUID;
        const mediaId = fc.sample(fc.uuid(), 1)[0] as UUID;
        const authorActor1 = fc.sample(fc.uuid(), 1)[0] as UUID;
        const authorActor2 = fc.sample(fc.uuid(), 1)[0] as UUID;
        const subjectActor1 = fc.sample(fc.uuid(), 1)[0] as UUID;
        const authorGroup1 = fc.sample(fc.uuid(), 1)[0] as UUID;
        const subjectGroup1 = fc.sample(fc.uuid(), 1)[0] as UUID;

        const targetEvent: Documentary = {
          id: targetId,
          type: EVENT_TYPES.DOCUMENTARY,
          date: new Date("2020-01-01"),
          payload: {
            title: "Documentary 1",
            media: mediaId,
            website: undefined,
            authors: {
              actors: [authorActor1],
              groups: [authorGroup1],
            },
            subjects: {
              actors: [subjectActor1],
              groups: [],
            },
          },
          ...createBaseEventProps(),
        };

        const sourceEvent: Documentary = {
          id: sourceId,
          type: EVENT_TYPES.DOCUMENTARY,
          date: new Date("2021-01-01"),
          payload: {
            title: "Documentary 2",
            media: mediaId,
            website: undefined,
            authors: {
              actors: [authorActor2],
              groups: [],
            },
            subjects: {
              actors: [],
              groups: [subjectGroup1],
            },
          },
          ...createBaseEventProps(),
        };

        const result = MergeEventsHelper.mergeEvents(
          [targetEvent, sourceEvent],
          EVENT_TYPES.DOCUMENTARY,
          createRelations({
            actors: [
              mock<Actor>({ id: authorActor1 }),
              mock<Actor>({ id: authorActor2 }),
              mock<Actor>({ id: subjectActor1 }),
            ],
            groups: [
              mock<Group>({ id: authorGroup1 }),
              mock<Group>({ id: subjectGroup1 }),
            ],
          }),
        );

        const payload = result.payload as Documentary["payload"];
        // The helper merges all actors/groups into subjects
        expect(payload.subjects.actors).toContain(authorActor1);
        expect(payload.subjects.actors).toContain(authorActor2);
        expect(payload.subjects.actors).toContain(subjectActor1);
        expect(payload.subjects.groups).toContain(authorGroup1);
        expect(payload.subjects.groups).toContain(subjectGroup1);
      });
    });

    describe("PATENT event payload merging", () => {
      test("Should merge owners from PATENT events", () => {
        const targetId = fc.sample(fc.uuid(), 1)[0] as UUID;
        const sourceId = fc.sample(fc.uuid(), 1)[0] as UUID;
        const ownerActor1 = fc.sample(fc.uuid(), 1)[0] as UUID;
        const ownerActor2 = fc.sample(fc.uuid(), 1)[0] as UUID;
        const ownerGroup1 = fc.sample(fc.uuid(), 1)[0] as UUID;
        const ownerGroup2 = fc.sample(fc.uuid(), 1)[0] as UUID;

        const targetEvent: Patent = {
          id: targetId,
          type: EVENT_TYPES.PATENT,
          date: new Date("2020-01-01"),
          payload: {
            title: "Patent 1",
            source: undefined,
            owners: {
              actors: [ownerActor1],
              groups: [ownerGroup1],
            },
          },
          ...createBaseEventProps(),
        };

        const sourceEvent: Patent = {
          id: sourceId,
          type: EVENT_TYPES.PATENT,
          date: new Date("2021-01-01"),
          payload: {
            title: "Patent 2",
            source: undefined,
            owners: {
              actors: [ownerActor2],
              groups: [ownerGroup2],
            },
          },
          ...createBaseEventProps(),
        };

        const result = MergeEventsHelper.mergeEvents(
          [targetEvent, sourceEvent],
          EVENT_TYPES.PATENT,
          createRelations({
            actors: [
              mock<Actor>({ id: ownerActor1 }),
              mock<Actor>({ id: ownerActor2 }),
            ],
            groups: [
              mock<Group>({ id: ownerGroup1 }),
              mock<Group>({ id: ownerGroup2 }),
            ],
          }),
        );

        const payload = result.payload as Patent["payload"];
        expect(payload.owners.actors).toEqual([ownerActor1, ownerActor2]);
        expect(payload.owners.groups).toEqual([ownerGroup1, ownerGroup2]);
      });

      test("Should deduplicate owners when merging PATENT events", () => {
        const targetId = fc.sample(fc.uuid(), 1)[0] as UUID;
        const sourceId = fc.sample(fc.uuid(), 1)[0] as UUID;
        const sharedOwner = fc.sample(fc.uuid(), 1)[0] as UUID;
        const uniqueOwner = fc.sample(fc.uuid(), 1)[0] as UUID;

        const targetEvent: Patent = {
          id: targetId,
          type: EVENT_TYPES.PATENT,
          date: new Date("2020-01-01"),
          payload: {
            title: "Patent 1",
            source: undefined,
            owners: {
              actors: [sharedOwner],
              groups: [],
            },
          },
          ...createBaseEventProps(),
        };

        const sourceEvent: Patent = {
          id: sourceId,
          type: EVENT_TYPES.PATENT,
          date: new Date("2021-01-01"),
          payload: {
            title: "Patent 2",
            source: undefined,
            owners: {
              actors: [sharedOwner, uniqueOwner],
              groups: [],
            },
          },
          ...createBaseEventProps(),
        };

        const result = MergeEventsHelper.mergeEvents(
          [targetEvent, sourceEvent],
          EVENT_TYPES.PATENT,
          createRelations({
            actors: [
              mock<Actor>({ id: sharedOwner }),
              mock<Actor>({ id: uniqueOwner }),
            ],
          }),
        );

        const payload = result.payload as Patent["payload"];
        expect(payload.owners.actors).toEqual([sharedOwner, uniqueOwner]);
      });
    });

    describe("SCIENTIFIC_STUDY event payload merging", () => {
      test("Should merge authors from SCIENTIFIC_STUDY events", () => {
        const targetId = fc.sample(fc.uuid(), 1)[0] as UUID;
        const sourceId = fc.sample(fc.uuid(), 1)[0] as UUID;
        const urlId = fc.sample(fc.uuid(), 1)[0] as UUID;
        const author1 = fc.sample(fc.uuid(), 1)[0] as UUID;
        const author2 = fc.sample(fc.uuid(), 1)[0] as UUID;
        const author3 = fc.sample(fc.uuid(), 1)[0] as UUID;

        const targetEvent: ScientificStudy = {
          id: targetId,
          type: EVENT_TYPES.SCIENTIFIC_STUDY,
          date: new Date("2020-01-01"),
          payload: {
            title: "Study 1",
            url: urlId,
            image: undefined,
            authors: [author1],
            publisher: undefined,
          },
          ...createBaseEventProps(),
        };

        const sourceEvent: ScientificStudy = {
          id: sourceId,
          type: EVENT_TYPES.SCIENTIFIC_STUDY,
          date: new Date("2021-01-01"),
          payload: {
            title: "Study 2",
            url: urlId,
            image: undefined,
            authors: [author2, author3],
            publisher: undefined,
          },
          ...createBaseEventProps(),
        };

        const result = MergeEventsHelper.mergeEvents(
          [targetEvent, sourceEvent],
          EVENT_TYPES.SCIENTIFIC_STUDY,
          createRelations({
            actors: [
              mock<Actor>({ id: author1 }),
              mock<Actor>({ id: author2 }),
              mock<Actor>({ id: author3 }),
            ],
          }),
        );

        const payload = result.payload as ScientificStudy["payload"];
        expect(payload.authors).toEqual([author1, author2, author3]);
      });

      test("Should deduplicate authors when merging SCIENTIFIC_STUDY events", () => {
        const targetId = fc.sample(fc.uuid(), 1)[0] as UUID;
        const sourceId = fc.sample(fc.uuid(), 1)[0] as UUID;
        const urlId = fc.sample(fc.uuid(), 1)[0] as UUID;
        const sharedAuthor = fc.sample(fc.uuid(), 1)[0] as UUID;
        const uniqueAuthor = fc.sample(fc.uuid(), 1)[0] as UUID;

        const targetEvent: ScientificStudy = {
          id: targetId,
          type: EVENT_TYPES.SCIENTIFIC_STUDY,
          date: new Date("2020-01-01"),
          payload: {
            title: "Study 1",
            url: urlId,
            image: undefined,
            authors: [sharedAuthor],
            publisher: undefined,
          },
          ...createBaseEventProps(),
        };

        const sourceEvent: ScientificStudy = {
          id: sourceId,
          type: EVENT_TYPES.SCIENTIFIC_STUDY,
          date: new Date("2021-01-01"),
          payload: {
            title: "Study 2",
            url: urlId,
            image: undefined,
            authors: [sharedAuthor, uniqueAuthor],
            publisher: undefined,
          },
          ...createBaseEventProps(),
        };

        const result = MergeEventsHelper.mergeEvents(
          [targetEvent, sourceEvent],
          EVENT_TYPES.SCIENTIFIC_STUDY,
          createRelations({
            actors: [
              mock<Actor>({ id: sharedAuthor }),
              mock<Actor>({ id: uniqueAuthor }),
            ],
          }),
        );

        const payload = result.payload as ScientificStudy["payload"];
        expect(payload.authors).toEqual([sharedAuthor, uniqueAuthor]);
      });
    });

    describe("Cross-type event merging", () => {
      test("Should extract actors from UNCATEGORIZED and merge into SCIENTIFIC_STUDY authors", () => {
        const targetId = fc.sample(fc.uuid(), 1)[0] as UUID;
        const sourceId = fc.sample(fc.uuid(), 1)[0] as UUID;
        const urlId = fc.sample(fc.uuid(), 1)[0] as UUID;
        const actor1 = fc.sample(fc.uuid(), 1)[0] as UUID;
        const actor2 = fc.sample(fc.uuid(), 1)[0] as UUID;

        const targetEvent: Uncategorized = {
          id: targetId,
          type: EVENT_TYPES.UNCATEGORIZED,
          date: new Date("2020-01-01"),
          payload: {
            title: "Uncategorized event",
            location: undefined,
            endDate: undefined,
            actors: [actor1],
            groups: [],
            groupsMembers: [],
          },
          ...createBaseEventProps(),
        };

        const sourceEvent: ScientificStudy = {
          id: sourceId,
          type: EVENT_TYPES.SCIENTIFIC_STUDY,
          date: new Date("2021-01-01"),
          payload: {
            title: "Study",
            url: urlId,
            image: undefined,
            authors: [actor2],
            publisher: undefined,
          },
          ...createBaseEventProps(),
        };

        const result = MergeEventsHelper.mergeEvents(
          [targetEvent, sourceEvent],
          EVENT_TYPES.SCIENTIFIC_STUDY,
          createRelations({
            actors: [mock<Actor>({ id: actor1 }), mock<Actor>({ id: actor2 })],
          }),
        );

        const payload = result.payload as ScientificStudy["payload"];
        expect(payload.authors).toContain(actor1);
        expect(payload.authors).toContain(actor2);
      });
    });

    describe("Merging multiple events (more than 2)", () => {
      test("Should merge actors from three UNCATEGORIZED events", () => {
        const event1Id = fc.sample(fc.uuid(), 1)[0] as UUID;
        const event2Id = fc.sample(fc.uuid(), 1)[0] as UUID;
        const event3Id = fc.sample(fc.uuid(), 1)[0] as UUID;
        const actor1 = fc.sample(fc.uuid(), 1)[0] as UUID;
        const actor2 = fc.sample(fc.uuid(), 1)[0] as UUID;
        const actor3 = fc.sample(fc.uuid(), 1)[0] as UUID;

        const event1: Uncategorized = {
          id: event1Id,
          type: EVENT_TYPES.UNCATEGORIZED,
          date: new Date("2020-01-01"),
          payload: {
            title: "Event 1",
            location: undefined,
            endDate: undefined,
            actors: [actor1],
            groups: [],
            groupsMembers: [],
          },
          ...createBaseEventProps(),
        };

        const event2: Uncategorized = {
          id: event2Id,
          type: EVENT_TYPES.UNCATEGORIZED,
          date: new Date("2021-01-01"),
          payload: {
            title: "Event 2",
            location: undefined,
            endDate: undefined,
            actors: [actor2],
            groups: [],
            groupsMembers: [],
          },
          ...createBaseEventProps(),
        };

        const event3: Uncategorized = {
          id: event3Id,
          type: EVENT_TYPES.UNCATEGORIZED,
          date: new Date("2022-01-01"),
          payload: {
            title: "Event 3",
            location: undefined,
            endDate: undefined,
            actors: [actor3],
            groups: [],
            groupsMembers: [],
          },
          ...createBaseEventProps(),
        };

        const relations = {
          ...createRelations(),
          actors: [
            mock<Actor>({ id: actor1 }),
            mock<Actor>({ id: actor2 }),
            mock<Actor>({ id: actor3 }),
          ],
        };

        const result = MergeEventsHelper.mergeEvents(
          [event1, event2, event3],
          EVENT_TYPES.UNCATEGORIZED,
          relations,
        );

        const payload = result.payload as Uncategorized["payload"];
        expect(payload.actors).toEqual([actor1, actor2, actor3]);
      });
    });

    describe("Excerpt and body concatenation", () => {
      test("Should concatenate excerpts from multiple events", () => {
        const targetId = fc.sample(fc.uuid(), 1)[0] as UUID;
        const sourceId = fc.sample(fc.uuid(), 1)[0] as UUID;

        const excerpt1 = toInitialValue("First excerpt");
        const excerpt2 = toInitialValue("Second excerpt");

        const targetEvent: Uncategorized = {
          id: targetId,
          type: EVENT_TYPES.UNCATEGORIZED,
          date: new Date("2020-01-01"),
          payload: {
            title: "Target event",
            location: undefined,
            endDate: undefined,
            actors: [],
            groups: [],
            groupsMembers: [],
          },
          ...createBaseEventProps(),
          excerpt: excerpt1,
        };

        const sourceEvent: Uncategorized = {
          id: sourceId,
          type: EVENT_TYPES.UNCATEGORIZED,
          date: new Date("2021-01-01"),
          payload: {
            title: "Source event",
            location: undefined,
            endDate: undefined,
            actors: [],
            groups: [],
            groupsMembers: [],
          },
          ...createBaseEventProps(),
          excerpt: excerpt2,
        };

        const result = MergeEventsHelper.mergeEvents(
          [targetEvent, sourceEvent],
          EVENT_TYPES.UNCATEGORIZED,
          createRelations(),
        );

        // The merged excerpt should contain blocks from both events
        expect(result.excerpt).toBeDefined();
        expect(Array.isArray(result.excerpt)).toBe(true);
        const mergedExcerpt = result.excerpt as BlockNoteDocument;
        expect(mergedExcerpt.length).toBe(
          (excerpt1?.length ?? 0) + (excerpt2?.length ?? 0),
        );
      });

      test("Should concatenate body from multiple events", () => {
        const targetId = fc.sample(fc.uuid(), 1)[0] as UUID;
        const sourceId = fc.sample(fc.uuid(), 1)[0] as UUID;

        const body1 = toInitialValue("First body content");
        const body2 = toInitialValue("Second body content");

        const targetEvent: Uncategorized = {
          id: targetId,
          type: EVENT_TYPES.UNCATEGORIZED,
          date: new Date("2020-01-01"),
          payload: {
            title: "Target event",
            location: undefined,
            endDate: undefined,
            actors: [],
            groups: [],
            groupsMembers: [],
          },
          ...createBaseEventProps(),
          body: body1,
        };

        const sourceEvent: Uncategorized = {
          id: sourceId,
          type: EVENT_TYPES.UNCATEGORIZED,
          date: new Date("2021-01-01"),
          payload: {
            title: "Source event",
            location: undefined,
            endDate: undefined,
            actors: [],
            groups: [],
            groupsMembers: [],
          },
          ...createBaseEventProps(),
          body: body2,
        };

        const result = MergeEventsHelper.mergeEvents(
          [targetEvent, sourceEvent],
          EVENT_TYPES.UNCATEGORIZED,
          createRelations(),
        );

        expect(result.body).toBeDefined();
        expect(Array.isArray(result.body)).toBe(true);
        const mergedBody = result.body as BlockNoteDocument;
        expect(mergedBody.length).toBe(
          (body1?.length ?? 0) + (body2?.length ?? 0),
        );
      });

      test("Should handle null excerpt gracefully", () => {
        const targetId = fc.sample(fc.uuid(), 1)[0] as UUID;
        const sourceId = fc.sample(fc.uuid(), 1)[0] as UUID;

        const excerpt2 = toInitialValue("Only source has excerpt");

        const targetEvent: Uncategorized = {
          id: targetId,
          type: EVENT_TYPES.UNCATEGORIZED,
          date: new Date("2020-01-01"),
          payload: {
            title: "Target event",
            location: undefined,
            endDate: undefined,
            actors: [],
            groups: [],
            groupsMembers: [],
          },
          ...createBaseEventProps(),
          excerpt: null,
        };

        const sourceEvent: Uncategorized = {
          id: sourceId,
          type: EVENT_TYPES.UNCATEGORIZED,
          date: new Date("2021-01-01"),
          payload: {
            title: "Source event",
            location: undefined,
            endDate: undefined,
            actors: [],
            groups: [],
            groupsMembers: [],
          },
          ...createBaseEventProps(),
          excerpt: excerpt2,
        };

        const result = MergeEventsHelper.mergeEvents(
          [targetEvent, sourceEvent],
          EVENT_TYPES.UNCATEGORIZED,
          createRelations(),
        );

        expect(result.excerpt).toBeDefined();
        expect(Array.isArray(result.excerpt)).toBe(true);
        const mergedExcerpt = result.excerpt as BlockNoteDocument;
        expect(mergedExcerpt.length).toBe(excerpt2?.length ?? 0);
      });
    });

    describe("Common event properties merging", () => {
      test("Should merge links from multiple events", () => {
        const targetId = fc.sample(fc.uuid(), 1)[0] as UUID;
        const sourceId = fc.sample(fc.uuid(), 1)[0] as UUID;
        const link1 = fc.sample(fc.uuid(), 1)[0] as UUID;
        const link2 = fc.sample(fc.uuid(), 1)[0] as UUID;
        const link3 = fc.sample(fc.uuid(), 1)[0] as UUID;

        const targetEvent: Uncategorized = {
          id: targetId,
          type: EVENT_TYPES.UNCATEGORIZED,
          date: new Date("2020-01-01"),
          payload: {
            title: "Target event",
            location: undefined,
            endDate: undefined,
            actors: [],
            groups: [],
            groupsMembers: [],
          },
          ...createBaseEventProps(),
          links: [link1],
        };

        const sourceEvent: Uncategorized = {
          id: sourceId,
          type: EVENT_TYPES.UNCATEGORIZED,
          date: new Date("2021-01-01"),
          payload: {
            title: "Source event",
            location: undefined,
            endDate: undefined,
            actors: [],
            groups: [],
            groupsMembers: [],
          },
          ...createBaseEventProps(),
          links: [link2, link3],
        };

        const result = MergeEventsHelper.mergeEvents(
          [targetEvent, sourceEvent],
          EVENT_TYPES.UNCATEGORIZED,
          createRelations(),
        );

        expect(result.links).toEqual([link1, link2, link3]);
      });

      test("Should merge media from multiple events", () => {
        const targetId = fc.sample(fc.uuid(), 1)[0] as UUID;
        const sourceId = fc.sample(fc.uuid(), 1)[0] as UUID;
        const media1 = fc.sample(fc.uuid(), 1)[0] as UUID;
        const media2 = fc.sample(fc.uuid(), 1)[0] as UUID;

        const targetEvent: Uncategorized = {
          id: targetId,
          type: EVENT_TYPES.UNCATEGORIZED,
          date: new Date("2020-01-01"),
          payload: {
            title: "Target event",
            location: undefined,
            endDate: undefined,
            actors: [],
            groups: [],
            groupsMembers: [],
          },
          ...createBaseEventProps(),
          media: [media1],
        };

        const sourceEvent: Uncategorized = {
          id: sourceId,
          type: EVENT_TYPES.UNCATEGORIZED,
          date: new Date("2021-01-01"),
          payload: {
            title: "Source event",
            location: undefined,
            endDate: undefined,
            actors: [],
            groups: [],
            groupsMembers: [],
          },
          ...createBaseEventProps(),
          media: [media2],
        };

        const result = MergeEventsHelper.mergeEvents(
          [targetEvent, sourceEvent],
          EVENT_TYPES.UNCATEGORIZED,
          createRelations(),
        );

        expect(result.media).toEqual([media1, media2]);
      });

      test("Should merge keywords from multiple events", () => {
        const targetId = fc.sample(fc.uuid(), 1)[0] as UUID;
        const sourceId = fc.sample(fc.uuid(), 1)[0] as UUID;
        const keyword1 = fc.sample(fc.uuid(), 1)[0] as UUID;
        const keyword2 = fc.sample(fc.uuid(), 1)[0] as UUID;

        const targetEvent: Uncategorized = {
          id: targetId,
          type: EVENT_TYPES.UNCATEGORIZED,
          date: new Date("2020-01-01"),
          payload: {
            title: "Target event",
            location: undefined,
            endDate: undefined,
            actors: [],
            groups: [],
            groupsMembers: [],
          },
          ...createBaseEventProps(),
          keywords: [keyword1],
        };

        const sourceEvent: Uncategorized = {
          id: sourceId,
          type: EVENT_TYPES.UNCATEGORIZED,
          date: new Date("2021-01-01"),
          payload: {
            title: "Source event",
            location: undefined,
            endDate: undefined,
            actors: [],
            groups: [],
            groupsMembers: [],
          },
          ...createBaseEventProps(),
          keywords: [keyword2],
        };

        const result = MergeEventsHelper.mergeEvents(
          [targetEvent, sourceEvent],
          EVENT_TYPES.UNCATEGORIZED,
          createRelations(),
        );

        expect(result.keywords).toEqual([keyword1, keyword2]);
      });

      test("Should deduplicate links when merging", () => {
        const targetId = fc.sample(fc.uuid(), 1)[0] as UUID;
        const sourceId = fc.sample(fc.uuid(), 1)[0] as UUID;
        const sharedLink = fc.sample(fc.uuid(), 1)[0] as UUID;
        const uniqueLink = fc.sample(fc.uuid(), 1)[0] as UUID;

        const targetEvent: Uncategorized = {
          id: targetId,
          type: EVENT_TYPES.UNCATEGORIZED,
          date: new Date("2020-01-01"),
          payload: {
            title: "Target event",
            location: undefined,
            endDate: undefined,
            actors: [],
            groups: [],
            groupsMembers: [],
          },
          ...createBaseEventProps(),
          links: [sharedLink],
        };

        const sourceEvent: Uncategorized = {
          id: sourceId,
          type: EVENT_TYPES.UNCATEGORIZED,
          date: new Date("2021-01-01"),
          payload: {
            title: "Source event",
            location: undefined,
            endDate: undefined,
            actors: [],
            groups: [],
            groupsMembers: [],
          },
          ...createBaseEventProps(),
          links: [sharedLink, uniqueLink],
        };

        const result = MergeEventsHelper.mergeEvents(
          [targetEvent, sourceEvent],
          EVENT_TYPES.UNCATEGORIZED,
          createRelations(),
        );

        expect(result.links).toEqual([sharedLink, uniqueLink]);
      });
    });
  });
});
