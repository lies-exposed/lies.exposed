import { type Event } from "@liexp/io/lib/http/Events/index.js";
import { DocumentaryEventArb } from "@liexp/test/lib/arbitrary/events/DocumentaryEvent.arbitrary.js";
import fc from "fast-check";
import * as E from "fp-ts/lib/Either.js";
import { describe, expect, it } from "vitest";
import { type EventV2Entity } from "../../../entities/Event.v2.entity.js";
import { DocumentaryIO } from "../documentary.io.js";

const toEventEntity = (event: Event): EventV2Entity => ({
  ...event,
  date: new Date(event.date),
  createdAt: new Date(event.createdAt),
  updatedAt: new Date(event.updatedAt),
  deletedAt: event.deletedAt ? new Date(event.deletedAt) : null,
  excerpt: event.excerpt ?? null,
  body: event.body ?? null,
  links: [...event.links],
  media: [...event.media],
  keywords: [...event.keywords],
  socialPosts: [],
  actors: [],
  groups: [],
  location: null,
  draft: false,
  stories: [],
});

describe("DocumentaryIO", () => {
  describe("decodeSingle", () => {
    it("should decode a documentary event entity to Documentary HTTP type", () => {
      const event = fc.sample(DocumentaryEventArb, 1)[0];
      const entity = toEventEntity(event);
      const result = DocumentaryIO.decodeSingle(entity);
      expect(E.isRight(result)).toBe(true);
    });

    it("should preserve documentary event id in decoded result", () => {
      const event = fc.sample(DocumentaryEventArb, 1)[0];
      const entity = toEventEntity(event);
      const result = DocumentaryIO.decodeSingle(entity);
      expect(E.isRight(result)).toBe(true);
      if (E.isRight(result)) {
        expect(result.right.id).toBe(event.id);
      }
    });

    it("should decode documentary event with type Documentary", () => {
      const event = fc.sample(DocumentaryEventArb, 1)[0];
      const entity = toEventEntity(event);
      const result = DocumentaryIO.decodeSingle(entity);
      expect(E.isRight(result)).toBe(true);
      if (E.isRight(result)) {
        expect(result.right.type).toBe("Documentary");
      }
    });

    it("should decode a documentary event with optional website UUID", () => {
      const event = fc.sample(DocumentaryEventArb, 1)[0];
      const entity = {
        ...toEventEntity(event),
        payload: {
          ...event.payload,
          website: event.payload.media, // website is UUID | undefined
        },
      };
      const result = DocumentaryIO.decodeSingle(entity);
      expect(E.isRight(result)).toBe(true);
    });

    it("should decode multiple documentary events via decodeMany", () => {
      const events = fc.sample(DocumentaryEventArb, 3).map(toEventEntity);
      const result = DocumentaryIO.decodeMany(events);
      expect(E.isRight(result)).toBe(true);
      if (E.isRight(result)) {
        expect(result.right.length).toBe(3);
      }
    });
  });

  describe("encodeSingle", () => {
    it("should return Left since encode is not implemented", () => {
      const event = fc.sample(DocumentaryEventArb, 1)[0];
      const entity = toEventEntity(event);
      const result = DocumentaryIO.encodeSingle(entity);
      expect(E.isLeft(result)).toBe(true);
    });
  });
});
