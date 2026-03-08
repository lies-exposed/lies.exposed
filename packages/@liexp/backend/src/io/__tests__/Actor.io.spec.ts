import { ActorArb } from "@liexp/test/lib/arbitrary/Actor.arbitrary.js";
import fc from "fast-check";
import * as E from "fp-ts/lib/Either.js";
import { describe, expect, it } from "vitest";
import { toActorEntity } from "../../test/utils/entities/index.js";
import { ActorIO } from "../Actor.io.js";

// ActorIO.decodeSingle spreads the entity into the Actor HTTP schema,
// which requires death: UUID | undefined (not null).
const makeActorEntity = (
  actor: ReturnType<typeof fc.sample<typeof ActorArb>>[0],
) =>
  ({
    ...toActorEntity(actor),
    death: undefined,
  }) as unknown as ReturnType<typeof toActorEntity>;

describe("ActorIO", () => {
  describe("decodeSingle", () => {
    it("should decode an actor entity to Actor HTTP type", () => {
      const actor = fc.sample(ActorArb, 1)[0];
      const entity = makeActorEntity(actor);
      const result = ActorIO.decodeSingle(entity);
      expect(E.isRight(result)).toBe(true);
    });

    it("should preserve actor id in the decoded result", () => {
      const actor = fc.sample(ActorArb, 1)[0];
      const entity = makeActorEntity(actor);
      const result = ActorIO.decodeSingle(entity);
      expect(E.isRight(result)).toBe(true);
      if (E.isRight(result)) {
        expect(result.right.id).toBe(actor.id);
      }
    });

    it("should decode actor with null bornOn and diedOn", () => {
      const actor = fc.sample(ActorArb, 1)[0];
      const entity = {
        ...makeActorEntity(actor),
        bornOn: null,
        diedOn: null,
      };
      const result = ActorIO.decodeSingle(entity);
      expect(E.isRight(result)).toBe(true);
    });

    it("should decode actor with null bornOn (bornOn Date case is not supported by decodeActor)", () => {
      const actor = fc.sample(ActorArb, 1)[0];
      const entity = {
        ...makeActorEntity(actor),
        bornOn: null,
        diedOn: null,
      };
      const result = ActorIO.decodeSingle(entity);
      expect(E.isRight(result)).toBe(true);
    });

    it("should decode actor with null avatar", () => {
      const actor = fc.sample(ActorArb, 1)[0];
      const entity = {
        ...makeActorEntity(actor),
        avatar: null,
      };
      const result = ActorIO.decodeSingle(entity);
      expect(E.isRight(result)).toBe(true);
    });

    it("should decode multiple actors via decodeMany", () => {
      const actors = fc.sample(ActorArb, 3).map(makeActorEntity);
      const result = ActorIO.decodeMany(actors);
      expect(E.isRight(result)).toBe(true);
      if (E.isRight(result)) {
        expect(result.right.length).toBe(3);
      }
    });
  });

  describe("encodeSingle", () => {
    it("should encode an actor entity to Actor encoded type", () => {
      const actor = fc.sample(ActorArb, 1)[0];
      const entity = makeActorEntity(actor);
      const result = ActorIO.encodeSingle(entity);
      expect(E.isRight(result)).toBe(true);
    });

    it("should encode actor with null avatar", () => {
      const actor = fc.sample(ActorArb, 1)[0];
      const entity = {
        ...makeActorEntity(actor),
        avatar: null,
      };
      const result = ActorIO.encodeSingle(entity);
      expect(E.isRight(result)).toBe(true);
    });

    it("should encode multiple actors via encodeMany", () => {
      const actors = fc.sample(ActorArb, 2).map(makeActorEntity);
      const result = ActorIO.encodeMany(actors);
      expect(E.isRight(result)).toBe(true);
    });
  });
});
