import { type UUID } from "@liexp/io/lib/http/Common/UUID.js";
import { EVENT_TYPES } from "@liexp/io/lib/http/Events/EventType.js";
import { describe, expect, it } from "vitest";
import { replaceActorInEventPayload } from "../replaceActorInEventPayload.js";

const createUUID = (id: string): UUID => id as UUID;

describe("replaceActorInEventPayload", () => {
  const sourceId = createUUID("source-actor");
  const targetId = createUUID("target-actor");
  const otherId = createUUID("other-actor");

  describe("Book events", () => {
    it("should replace actor in authors array", () => {
      const event = {
        type: EVENT_TYPES.BOOK,
        payload: {
          title: "Test Book",
          authors: [{ type: "Actor", id: sourceId }],
          publisher: undefined,
        },
      };

      const result = replaceActorInEventPayload(event, { sourceId, targetId });

      expect(result.payload.authors).toEqual([{ type: "Actor", id: targetId }]);
    });

    it("should replace actor in publisher", () => {
      const event = {
        type: EVENT_TYPES.BOOK,
        payload: {
          title: "Test Book",
          authors: [],
          publisher: { type: "Actor", id: sourceId },
        },
      };

      const result = replaceActorInEventPayload(event, { sourceId, targetId });

      expect(result.payload.publisher).toEqual({ type: "Actor", id: targetId });
    });

    it("should not replace non-matching actors", () => {
      const event = {
        type: EVENT_TYPES.BOOK,
        payload: {
          title: "Test Book",
          authors: [{ type: "Actor", id: otherId }],
          publisher: { type: "Group", id: sourceId },
        },
      };

      const result = replaceActorInEventPayload(event, { sourceId, targetId });

      expect(result.payload.authors).toEqual([{ type: "Actor", id: otherId }]);
      expect(result.payload.publisher).toEqual({ type: "Group", id: sourceId });
    });

    it("should not add duplicate if target already exists in authors", () => {
      const event = {
        type: EVENT_TYPES.BOOK,
        payload: {
          title: "Test Book",
          authors: [
            { type: "Actor", id: sourceId },
            { type: "Actor", id: targetId },
          ],
          publisher: undefined,
        },
      };

      const result = replaceActorInEventPayload(event, { sourceId, targetId });

      expect(result.payload.authors).toHaveLength(1);
      expect(result.payload.authors).toEqual([{ type: "Actor", id: targetId }]);
    });
  });

  describe("Quote events", () => {
    it("should replace actor in subject", () => {
      const event = {
        type: EVENT_TYPES.QUOTE,
        payload: {
          quote: "Test quote",
          subject: { type: "Actor", id: sourceId },
        },
      };

      const result = replaceActorInEventPayload(event, { sourceId, targetId });

      expect(result.payload.subject).toEqual({ type: "Actor", id: targetId });
    });

    it("should not replace group subject", () => {
      const event = {
        type: EVENT_TYPES.QUOTE,
        payload: {
          quote: "Test quote",
          subject: { type: "Group", id: sourceId },
        },
      };

      const result = replaceActorInEventPayload(event, { sourceId, targetId });

      expect(result.payload.subject).toEqual({ type: "Group", id: sourceId });
    });
  });

  describe("Death events", () => {
    it("should replace victim actor", () => {
      const event = {
        type: EVENT_TYPES.DEATH,
        payload: {
          victim: sourceId,
        },
      };

      const result = replaceActorInEventPayload(event, { sourceId, targetId });

      expect(result.payload.victim).toBe(targetId);
    });

    it("should not replace non-matching victim", () => {
      const event = {
        type: EVENT_TYPES.DEATH,
        payload: {
          victim: otherId,
        },
      };

      const result = replaceActorInEventPayload(event, { sourceId, targetId });

      expect(result.payload.victim).toBe(otherId);
    });
  });

  describe("Transaction events", () => {
    it("should replace actor in from field", () => {
      const event = {
        type: EVENT_TYPES.TRANSACTION,
        payload: {
          title: "Test Transaction",
          from: { type: "Actor", id: sourceId },
          to: { type: "Actor", id: otherId },
        },
      };

      const result = replaceActorInEventPayload(event, { sourceId, targetId });

      expect(result.payload.from).toEqual({ type: "Actor", id: targetId });
      expect(result.payload.to).toEqual({ type: "Actor", id: otherId });
    });

    it("should replace actor in to field", () => {
      const event = {
        type: EVENT_TYPES.TRANSACTION,
        payload: {
          title: "Test Transaction",
          from: { type: "Actor", id: otherId },
          to: { type: "Actor", id: sourceId },
        },
      };

      const result = replaceActorInEventPayload(event, { sourceId, targetId });

      expect(result.payload.from).toEqual({ type: "Actor", id: otherId });
      expect(result.payload.to).toEqual({ type: "Actor", id: targetId });
    });

    it("should replace actor in both from and to fields", () => {
      const event = {
        type: EVENT_TYPES.TRANSACTION,
        payload: {
          title: "Test Transaction",
          from: { type: "Actor", id: sourceId },
          to: { type: "Actor", id: sourceId },
        },
      };

      const result = replaceActorInEventPayload(event, { sourceId, targetId });

      expect(result.payload.from).toEqual({ type: "Actor", id: targetId });
      expect(result.payload.to).toEqual({ type: "Actor", id: targetId });
    });
  });

  describe("Patent events", () => {
    it("should replace actor in owners.actors", () => {
      const event = {
        type: EVENT_TYPES.PATENT,
        payload: {
          title: "Test Patent",
          owners: { actors: [sourceId, otherId], groups: [] },
        },
      };

      const result = replaceActorInEventPayload(event, { sourceId, targetId });

      expect(result.payload.owners.actors).toContain(targetId);
      expect(result.payload.owners.actors).toContain(otherId);
      expect(result.payload.owners.actors).not.toContain(sourceId);
    });

    it("should not add duplicate if target already exists", () => {
      const event = {
        type: EVENT_TYPES.PATENT,
        payload: {
          title: "Test Patent",
          owners: { actors: [sourceId, targetId], groups: [] },
        },
      };

      const result = replaceActorInEventPayload(event, { sourceId, targetId });

      expect(result.payload.owners.actors).toEqual([targetId]);
    });
  });

  describe("Documentary events", () => {
    it("should replace actor in authors.actors", () => {
      const event = {
        type: EVENT_TYPES.DOCUMENTARY,
        payload: {
          title: "Test Documentary",
          authors: { actors: [sourceId], groups: [] },
          subjects: { actors: [], groups: [] },
        },
      };

      const result = replaceActorInEventPayload(event, { sourceId, targetId });

      expect(result.payload.authors.actors).toContain(targetId);
      expect(result.payload.authors.actors).not.toContain(sourceId);
    });

    it("should replace actor in subjects.actors", () => {
      const event = {
        type: EVENT_TYPES.DOCUMENTARY,
        payload: {
          title: "Test Documentary",
          authors: { actors: [], groups: [] },
          subjects: { actors: [sourceId, otherId], groups: [] },
        },
      };

      const result = replaceActorInEventPayload(event, { sourceId, targetId });

      expect(result.payload.subjects.actors).toContain(targetId);
      expect(result.payload.subjects.actors).toContain(otherId);
      expect(result.payload.subjects.actors).not.toContain(sourceId);
    });

    it("should replace actor in both authors and subjects", () => {
      const event = {
        type: EVENT_TYPES.DOCUMENTARY,
        payload: {
          title: "Test Documentary",
          authors: { actors: [sourceId], groups: [] },
          subjects: { actors: [sourceId], groups: [] },
        },
      };

      const result = replaceActorInEventPayload(event, { sourceId, targetId });

      expect(result.payload.authors.actors).toEqual([targetId]);
      expect(result.payload.subjects.actors).toEqual([targetId]);
    });
  });

  describe("ScientificStudy events", () => {
    it("should replace actor in authors", () => {
      const event = {
        type: EVENT_TYPES.SCIENTIFIC_STUDY,
        payload: {
          title: "Test Study",
          authors: [sourceId, otherId],
        },
      };

      const result = replaceActorInEventPayload(event, { sourceId, targetId });

      expect(result.payload.authors).toContain(targetId);
      expect(result.payload.authors).toContain(otherId);
      expect(result.payload.authors).not.toContain(sourceId);
    });

    it("should not add duplicate if target already exists", () => {
      const event = {
        type: EVENT_TYPES.SCIENTIFIC_STUDY,
        payload: {
          title: "Test Study",
          authors: [sourceId, targetId],
        },
      };

      const result = replaceActorInEventPayload(event, { sourceId, targetId });

      expect(result.payload.authors).toEqual([targetId]);
    });
  });

  describe("Uncategorized events", () => {
    it("should replace actor in actors array", () => {
      const event = {
        type: EVENT_TYPES.UNCATEGORIZED,
        payload: {
          title: "Test Event",
          actors: [sourceId, otherId],
        },
      };

      const result = replaceActorInEventPayload(event, { sourceId, targetId });

      expect(result.payload.actors).toContain(targetId);
      expect(result.payload.actors).toContain(otherId);
      expect(result.payload.actors).not.toContain(sourceId);
    });

    it("should not add duplicate if target already exists", () => {
      const event = {
        type: EVENT_TYPES.UNCATEGORIZED,
        payload: {
          title: "Test Event",
          actors: [sourceId, targetId],
        },
      };

      const result = replaceActorInEventPayload(event, { sourceId, targetId });

      expect(result.payload.actors).toEqual([targetId]);
    });

    it("should not modify array if source not present", () => {
      const event = {
        type: EVENT_TYPES.UNCATEGORIZED,
        payload: {
          title: "Test Event",
          actors: [otherId],
        },
      };

      const result = replaceActorInEventPayload(event, { sourceId, targetId });

      expect(result.payload.actors).toEqual([otherId]);
    });
  });
});
