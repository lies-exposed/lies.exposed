import { describe, expect, it } from "vitest";
import { type UUID } from "../../../io/http/Common/UUID.js";
import { EVENT_TYPES } from "../../../io/http/Events/EventType.js";
import {
  addActorToEventPayload,
  removeActorFromEventPayload,
  addActorToEvent,
  removeActorFromEvent,
} from "../addActorToEventPayload.js";

const createUUID = (id: string): UUID => id as UUID;

describe("addActorToEventPayload", () => {
  const actorId = createUUID("actor-1");
  const existingActorId = createUUID("existing-actor");

  describe("Patent events", () => {
    it("should add actor to patent owners", () => {
      const event = {
        type: EVENT_TYPES.PATENT,
        payload: {
          title: "Test Patent",
          owners: { actors: [], groups: [] },
        },
      };

      const result = addActorToEventPayload(event, actorId);

      expect(result).toEqual({
        title: "Test Patent",
        owners: { actors: [actorId], groups: [] },
      });
    });

    it("should not duplicate actor in patent owners", () => {
      const event = {
        type: EVENT_TYPES.PATENT,
        payload: {
          title: "Test Patent",
          owners: { actors: [actorId], groups: [] },
        },
      };

      const result = addActorToEventPayload(event, actorId);

      expect(result).toEqual({
        title: "Test Patent",
        owners: { actors: [actorId], groups: [] },
      });
    });
  });

  describe("Documentary events", () => {
    it("should add actor to documentary subjects", () => {
      const event = {
        type: EVENT_TYPES.DOCUMENTARY,
        payload: {
          title: "Test Documentary",
          subjects: { actors: [], groups: [] },
          authors: { actors: [], groups: [] },
        },
      };

      const result = addActorToEventPayload(event, actorId);

      expect(result).toEqual({
        title: "Test Documentary",
        subjects: { actors: [actorId], groups: [] },
        authors: { actors: [], groups: [] },
      });
    });

    it("should not duplicate actor in documentary subjects", () => {
      const event = {
        type: EVENT_TYPES.DOCUMENTARY,
        payload: {
          title: "Test Documentary",
          subjects: { actors: [actorId], groups: [] },
          authors: { actors: [], groups: [] },
        },
      };

      const result = addActorToEventPayload(event, actorId);

      expect(result).toEqual({
        title: "Test Documentary",
        subjects: { actors: [actorId], groups: [] },
        authors: { actors: [], groups: [] },
      });
    });
  });

  describe("ScientificStudy events", () => {
    it("should add actor to scientific study authors", () => {
      const event = {
        type: EVENT_TYPES.SCIENTIFIC_STUDY,
        payload: {
          title: "Test Study",
          authors: [],
        },
      };

      const result = addActorToEventPayload(event, actorId);

      expect(result).toEqual({
        title: "Test Study",
        authors: [actorId],
      });
    });

    it("should not duplicate actor in scientific study authors", () => {
      const event = {
        type: EVENT_TYPES.SCIENTIFIC_STUDY,
        payload: {
          title: "Test Study",
          authors: [actorId],
        },
      };

      const result = addActorToEventPayload(event, actorId);

      expect(result).toEqual({
        title: "Test Study",
        authors: [actorId],
      });
    });
  });

  describe("Uncategorized events", () => {
    it("should add actor to uncategorized event actors", () => {
      const event = {
        type: EVENT_TYPES.UNCATEGORIZED,
        payload: {
          title: "Test Event",
          actors: [],
        },
      };

      const result = addActorToEventPayload(event, actorId);

      expect(result).toEqual({
        title: "Test Event",
        actors: [actorId],
      });
    });

    it("should not duplicate actor in uncategorized event actors", () => {
      const event = {
        type: EVENT_TYPES.UNCATEGORIZED,
        payload: {
          title: "Test Event",
          actors: [actorId],
        },
      };

      const result = addActorToEventPayload(event, actorId);

      expect(result).toEqual({
        title: "Test Event",
        actors: [actorId],
      });
    });
  });

  describe("Events that do not support adding actors", () => {
    it("should return null for Death events", () => {
      const event = {
        type: EVENT_TYPES.DEATH,
        payload: { victim: existingActorId },
      };

      const result = addActorToEventPayload(event, actorId);

      expect(result).toBeNull();
    });

    it("should return null for Quote events", () => {
      const event = {
        type: EVENT_TYPES.QUOTE,
        payload: {
          quote: "test",
          subject: { type: "Actor", id: existingActorId },
        },
      };

      const result = addActorToEventPayload(event, actorId);

      expect(result).toBeNull();
    });

    it("should return null for Transaction events", () => {
      const event = {
        type: EVENT_TYPES.TRANSACTION,
        payload: {
          title: "Test",
          from: { type: "Actor", id: existingActorId },
          to: { type: "Actor", id: existingActorId },
        },
      };

      const result = addActorToEventPayload(event, actorId);

      expect(result).toBeNull();
    });

    it("should return null for Book events", () => {
      const event = {
        type: EVENT_TYPES.BOOK,
        payload: { title: "Test Book", authors: [] },
      };

      const result = addActorToEventPayload(event, actorId);

      expect(result).toBeNull();
    });
  });
});

describe("removeActorFromEventPayload", () => {
  const actorId = createUUID("actor-1");
  const actorId2 = createUUID("actor-2");

  describe("Patent events", () => {
    it("should remove actor from patent owners", () => {
      const event = {
        type: EVENT_TYPES.PATENT,
        payload: {
          title: "Test Patent",
          owners: { actors: [actorId, actorId2], groups: [] },
        },
      };

      const result = removeActorFromEventPayload(event, actorId);

      expect(result).toEqual({
        title: "Test Patent",
        owners: { actors: [actorId2], groups: [] },
      });
    });

    it("should handle removing non-existent actor", () => {
      const event = {
        type: EVENT_TYPES.PATENT,
        payload: {
          title: "Test Patent",
          owners: { actors: [actorId2], groups: [] },
        },
      };

      const result = removeActorFromEventPayload(event, actorId);

      expect(result).toEqual({
        title: "Test Patent",
        owners: { actors: [actorId2], groups: [] },
      });
    });
  });

  describe("Documentary events", () => {
    it("should remove actor from both authors and subjects", () => {
      const event = {
        type: EVENT_TYPES.DOCUMENTARY,
        payload: {
          title: "Test Documentary",
          authors: { actors: [actorId], groups: [] },
          subjects: { actors: [actorId, actorId2], groups: [] },
        },
      };

      const result = removeActorFromEventPayload(event, actorId);

      expect(result).toEqual({
        title: "Test Documentary",
        authors: { actors: [], groups: [] },
        subjects: { actors: [actorId2], groups: [] },
      });
    });
  });

  describe("ScientificStudy events", () => {
    it("should remove actor from authors", () => {
      const event = {
        type: EVENT_TYPES.SCIENTIFIC_STUDY,
        payload: {
          title: "Test Study",
          authors: [actorId, actorId2],
        },
      };

      const result = removeActorFromEventPayload(event, actorId);

      expect(result).toEqual({
        title: "Test Study",
        authors: [actorId2],
      });
    });
  });

  describe("Uncategorized events", () => {
    it("should remove actor from actors array", () => {
      const event = {
        type: EVENT_TYPES.UNCATEGORIZED,
        payload: {
          title: "Test Event",
          actors: [actorId, actorId2],
        },
      };

      const result = removeActorFromEventPayload(event, actorId);

      expect(result).toEqual({
        title: "Test Event",
        actors: [actorId2],
      });
    });
  });

  describe("Events that do not support removing actors", () => {
    it("should return original payload for Death events", () => {
      const payload = { victim: actorId };
      const event = {
        type: EVENT_TYPES.DEATH,
        payload,
      };

      const result = removeActorFromEventPayload(event, actorId);

      expect(result).toEqual(payload);
    });

    it("should return original payload for Quote events", () => {
      const payload = {
        quote: "test",
        subject: { type: "Actor", id: actorId },
      };
      const event = {
        type: EVENT_TYPES.QUOTE,
        payload,
      };

      const result = removeActorFromEventPayload(event, actorId);

      expect(result).toEqual(payload);
    });
  });
});

describe("addActorToEvent", () => {
  const actorId = createUUID("actor-1");

  it("should return event with updated payload", () => {
    const event = {
      id: createUUID("event-1"),
      type: EVENT_TYPES.UNCATEGORIZED,
      payload: {
        title: "Test Event",
        actors: [],
      },
    };

    const result = addActorToEvent(event, actorId);

    expect(result.id).toBe(event.id);
    expect(result.payload).toEqual({
      title: "Test Event",
      actors: [actorId],
    });
  });
});

describe("removeActorFromEvent", () => {
  const actorId = createUUID("actor-1");
  const actorId2 = createUUID("actor-2");

  it("should return event with updated payload", () => {
    const event = {
      id: createUUID("event-1"),
      type: EVENT_TYPES.UNCATEGORIZED,
      payload: {
        title: "Test Event",
        actors: [actorId, actorId2],
      },
    };

    const result = removeActorFromEvent(event, actorId);

    expect(result.id).toBe(event.id);
    expect(result.payload).toEqual({
      title: "Test Event",
      actors: [actorId2],
    });
  });
});
