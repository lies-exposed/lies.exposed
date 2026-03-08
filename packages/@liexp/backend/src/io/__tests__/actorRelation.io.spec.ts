import { uuid } from "@liexp/io/lib/http/Common/UUID.js";
import { ActorArb } from "@liexp/test/lib/arbitrary/Actor.arbitrary.js";
import fc from "fast-check";
import * as E from "fp-ts/lib/Either.js";
import { describe, expect, it } from "vitest";
import type { ActorRelationEntity } from "../../entities/ActorRelation.entity.js";
import { toActorEntity } from "../../test/utils/entities/index.js";
import { ActorRelationIO } from "../actorRelation.io.js";

// ActorIO uses ActorIO.encodeSingle which calls encodeActor for both actor fields.
// ActorIO internals require death: undefined (not null) for schema compatibility.
const makeActorEntity = (
  actor: ReturnType<typeof fc.sample<typeof ActorArb>>[0],
) =>
  ({
    ...toActorEntity(actor),
    death: undefined,
  }) as unknown as ReturnType<typeof toActorEntity>;

const makeActorRelationEntity = (overrides: Partial<any> = {}) => {
  const actor = fc.sample(ActorArb, 1)[0];
  const relatedActor = fc.sample(ActorArb, 1)[0];

  return {
    id: uuid(),
    type: "PARENT_CHILD" as const,
    startDate: new Date("2000-01-01"),
    endDate: null,
    excerpt: null,
    actor: makeActorEntity(actor),
    relatedActor: makeActorEntity(relatedActor),
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    ...overrides,
  };
};

describe("ActorRelationIO", () => {
  describe("decodeSingle", () => {
    it("should decode an actor relation entity to ActorRelation HTTP type", () => {
      const entity = makeActorRelationEntity();
      const result = ActorRelationIO.decodeSingle(
        entity as unknown as ActorRelationEntity,
      );
      expect(E.isRight(result)).toBe(true);
    });

    it("should preserve actor relation id in decoded result", () => {
      const id = uuid();
      const entity = makeActorRelationEntity({ id });
      const result = ActorRelationIO.decodeSingle(
        entity as unknown as ActorRelationEntity,
      );
      expect(E.isRight(result)).toBe(true);
      if (E.isRight(result)) {
        expect(result.right.id).toBe(id);
      }
    });

    it("should decode actor relation with SPOUSE type", () => {
      const entity = makeActorRelationEntity({ type: "SPOUSE" });
      const result = ActorRelationIO.decodeSingle(
        entity as unknown as ActorRelationEntity,
      );
      expect(E.isRight(result)).toBe(true);
    });

    it("should decode actor relation with PARTNER type", () => {
      const entity = makeActorRelationEntity({ type: "PARTNER" });
      const result = ActorRelationIO.decodeSingle(
        entity as unknown as ActorRelationEntity,
      );
      expect(E.isRight(result)).toBe(true);
    });

    it("should decode actor relation with null endDate", () => {
      const entity = makeActorRelationEntity({ endDate: null });
      const result = ActorRelationIO.decodeSingle(
        entity as unknown as ActorRelationEntity,
      );
      expect(E.isRight(result)).toBe(true);
    });

    it("should decode multiple actor relations via decodeMany", () => {
      const entities = [makeActorRelationEntity(), makeActorRelationEntity()];
      const result = ActorRelationIO.decodeMany(
        entities as unknown as ActorRelationEntity[],
      );
      expect(E.isRight(result)).toBe(true);
      if (E.isRight(result)) {
        expect(result.right.length).toBe(2);
      }
    });
  });

  describe("encodeSingle", () => {
    it("should return Left since encode is not implemented", () => {
      const entity = makeActorRelationEntity();
      const result = ActorRelationIO.encodeSingle(entity as never);
      expect(E.isLeft(result)).toBe(true);
    });
  });
});
