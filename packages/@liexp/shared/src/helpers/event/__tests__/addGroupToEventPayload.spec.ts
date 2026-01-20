import { type UUID } from "@liexp/io/lib/http/Common/UUID.js";
import { EVENT_TYPES } from "@liexp/io/lib/http/Events/EventType.js";
import { describe, expect, it } from "vitest";
import {
  addGroupToEventPayload,
  removeGroupFromEventPayload,
} from "../addGroupToEventPayload.js";

const createUUID = (id: string): UUID => id as UUID;

describe("addGroupToEventPayload", () => {
  const groupId = createUUID("group-1");

  describe("Patent events", () => {
    it("should add group to patent owners", () => {
      const event = {
        type: EVENT_TYPES.PATENT,
        payload: {
          title: "Test Patent",
          owners: { actors: [], groups: [] },
        },
      };

      const result = addGroupToEventPayload(event, groupId);

      expect(result).not.toBeNull();
      expect(result?.payload).toEqual({
        title: "Test Patent",
        owners: { actors: [], groups: [groupId] },
      });
    });

    it("should not duplicate group in patent owners", () => {
      const event = {
        type: EVENT_TYPES.PATENT,
        payload: {
          title: "Test Patent",
          owners: { actors: [], groups: [groupId] },
        },
      };

      const result = addGroupToEventPayload(event, groupId);

      expect(result).not.toBeNull();
      expect(result?.payload).toEqual({
        title: "Test Patent",
        owners: { actors: [], groups: [groupId] },
      });
    });
  });

  describe("Documentary events", () => {
    it("should add group to documentary subjects", () => {
      const event = {
        type: EVENT_TYPES.DOCUMENTARY,
        payload: {
          title: "Test Documentary",
          subjects: { actors: [], groups: [] },
          authors: { actors: [], groups: [] },
        },
      };

      const result = addGroupToEventPayload(event, groupId);

      expect(result).not.toBeNull();
      expect(result?.payload).toEqual({
        title: "Test Documentary",
        subjects: { actors: [], groups: [groupId] },
        authors: { actors: [], groups: [] },
      });
    });

    it("should not duplicate group in documentary subjects", () => {
      const event = {
        type: EVENT_TYPES.DOCUMENTARY,
        payload: {
          title: "Test Documentary",
          subjects: { actors: [], groups: [groupId] },
          authors: { actors: [], groups: [] },
        },
      };

      const result = addGroupToEventPayload(event, groupId);

      expect(result).not.toBeNull();
      expect(result?.payload).toEqual({
        title: "Test Documentary",
        subjects: { actors: [], groups: [groupId] },
        authors: { actors: [], groups: [] },
      });
    });
  });

  describe("Uncategorized events", () => {
    it("should add group to uncategorized event groups", () => {
      const event = {
        type: EVENT_TYPES.UNCATEGORIZED,
        payload: {
          title: "Test Event",
          groups: [],
        },
      };

      const result = addGroupToEventPayload(event, groupId);

      expect(result).not.toBeNull();
      expect(result?.payload).toEqual({
        title: "Test Event",
        groups: [groupId],
      });
    });

    it("should not duplicate group in uncategorized event groups", () => {
      const event = {
        type: EVENT_TYPES.UNCATEGORIZED,
        payload: {
          title: "Test Event",
          groups: [groupId],
        },
      };

      const result = addGroupToEventPayload(event, groupId);

      expect(result).not.toBeNull();
      expect(result?.payload).toEqual({
        title: "Test Event",
        groups: [groupId],
      });
    });
  });

  describe("Events that do not support adding groups", () => {
    const actorId = createUUID("actor-1");

    it("should return null for Death events", () => {
      const event = {
        type: EVENT_TYPES.DEATH,
        payload: { victim: actorId },
      };

      const result = addGroupToEventPayload(event, groupId);

      expect(result).toBeNull();
    });

    it("should return null for Quote events", () => {
      const event = {
        type: EVENT_TYPES.QUOTE,
        payload: { quote: "test", subject: { type: "Actor", id: actorId } },
      };

      const result = addGroupToEventPayload(event, groupId);

      expect(result).toBeNull();
    });

    it("should return null for Transaction events", () => {
      const event = {
        type: EVENT_TYPES.TRANSACTION,
        payload: {
          title: "Test",
          from: { type: "Actor", id: actorId },
          to: { type: "Actor", id: actorId },
        },
      };

      const result = addGroupToEventPayload(event, groupId);

      expect(result).toBeNull();
    });

    it("should return null for Book events", () => {
      const event = {
        type: EVENT_TYPES.BOOK,
        payload: { title: "Test Book", authors: [] },
      };

      const result = addGroupToEventPayload(event, groupId);

      expect(result).toBeNull();
    });

    it("should return null for ScientificStudy events", () => {
      const event = {
        type: EVENT_TYPES.SCIENTIFIC_STUDY,
        payload: { title: "Test Study", authors: [] },
      };

      const result = addGroupToEventPayload(event, groupId);

      expect(result).toBeNull();
    });
  });
});

describe("removeGroupFromEventPayload", () => {
  const groupId = createUUID("group-1");
  const groupId2 = createUUID("group-2");

  describe("Patent events", () => {
    it("should remove group from patent owners", () => {
      const event = {
        type: EVENT_TYPES.PATENT,
        payload: {
          title: "Test Patent",
          owners: { actors: [], groups: [groupId, groupId2] },
        },
      };

      const result = removeGroupFromEventPayload(event, groupId);

      expect(result.payload).toEqual({
        title: "Test Patent",
        owners: { actors: [], groups: [groupId2] },
      });
    });

    it("should handle removing non-existent group", () => {
      const event = {
        type: EVENT_TYPES.PATENT,
        payload: {
          title: "Test Patent",
          owners: { actors: [], groups: [groupId2] },
        },
      };

      const result = removeGroupFromEventPayload(event, groupId);

      expect(result.payload).toEqual({
        title: "Test Patent",
        owners: { actors: [], groups: [groupId2] },
      });
    });
  });

  describe("Documentary events", () => {
    it("should remove group from both authors and subjects", () => {
      const event = {
        type: EVENT_TYPES.DOCUMENTARY,
        payload: {
          title: "Test Documentary",
          authors: { actors: [], groups: [groupId] },
          subjects: { actors: [], groups: [groupId, groupId2] },
        },
      };

      const result = removeGroupFromEventPayload(event, groupId);

      expect(result.payload).toEqual({
        title: "Test Documentary",
        authors: { actors: [], groups: [] },
        subjects: { actors: [], groups: [groupId2] },
      });
    });
  });

  describe("Uncategorized events", () => {
    it("should remove group from groups array", () => {
      const event = {
        type: EVENT_TYPES.UNCATEGORIZED,
        payload: {
          title: "Test Event",
          groups: [groupId, groupId2],
        },
      };

      const result = removeGroupFromEventPayload(event, groupId);

      expect(result.payload).toEqual({
        title: "Test Event",
        groups: [groupId2],
      });
    });
  });

  describe("Events that do not support removing groups", () => {
    const actorId = createUUID("actor-1");

    it("should return original event for Death events", () => {
      const event = {
        type: EVENT_TYPES.DEATH,
        payload: { victim: actorId },
      };

      const result = removeGroupFromEventPayload(event, groupId);

      expect(result).toEqual(event);
    });

    it("should return original event for Quote events", () => {
      const event = {
        type: EVENT_TYPES.QUOTE,
        payload: { quote: "test", subject: { type: "Actor", id: actorId } },
      };

      const result = removeGroupFromEventPayload(event, groupId);

      expect(result).toEqual(event);
    });

    it("should return original event for ScientificStudy events", () => {
      const event = {
        type: EVENT_TYPES.SCIENTIFIC_STUDY,
        payload: { title: "Test Study", authors: [] },
      };

      const result = removeGroupFromEventPayload(event, groupId);

      expect(result).toEqual(event);
    });
  });
});
