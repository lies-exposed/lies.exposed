import { uuid } from "@liexp/io/lib/http/Common/UUID.js";
import { NationArb } from "@liexp/test/lib/arbitrary/Nation.arbitrary.js";
import fc from "fast-check";
import * as E from "fp-ts/lib/Either.js";
import { describe, expect, it } from "vitest";
import type { NationEntity } from "../../entities/Nation.entity.js";
import { NationIO } from "../Nation.io.js";

describe("NationIO", () => {
  describe("decodeSingle", () => {
    it("should decode a manually constructed nation entity", () => {
      const nationEntity = {
        id: uuid(),
        name: "France",
        isoCode: "FR",
        description: null,
        actors: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };
      const result = NationIO.decodeSingle(
        nationEntity as unknown as NationEntity,
      );
      expect(E.isRight(result)).toBe(true);
    });

    it("should decode a nation from arbitrary data", () => {
      const nation = fc.sample(NationArb, 1)[0];
      const nationEntity = {
        ...nation,
        description: null,
        actors: [],
        deletedAt: nation.deletedAt ?? null,
      };
      const result = NationIO.decodeSingle(
        nationEntity as unknown as NationEntity,
      );
      expect(E.isRight(result)).toBe(true);
    });

    it("should preserve nation id", () => {
      const id = uuid();
      const nationEntity = {
        id,
        name: "Germany",
        isoCode: "DE",
        description: null,
        actors: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };
      const result = NationIO.decodeSingle(
        nationEntity as unknown as NationEntity,
      );
      expect(E.isRight(result)).toBe(true);
      if (E.isRight(result)) {
        expect(result.right.id).toBe(id);
      }
    });

    it("should decode multiple nations via decodeMany", () => {
      const nations = [
        {
          id: uuid(),
          name: "Spain",
          isoCode: "ES",
          description: null,
          actors: [],
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
        },
        {
          id: uuid(),
          name: "Italy",
          isoCode: "IT",
          description: null,
          actors: [],
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
        },
      ];
      const result = NationIO.decodeMany(nations as unknown as NationEntity[]);
      expect(E.isRight(result)).toBe(true);
      if (E.isRight(result)) {
        expect(result.right.length).toBe(2);
      }
    });
  });

  describe("encodeSingle", () => {
    it("should return Left since encode is not implemented", () => {
      const nationEntity = {
        id: uuid(),
        name: "France",
        isoCode: "FR",
        description: null,
        actors: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };
      const result = NationIO.encodeSingle(nationEntity as never);
      expect(E.isLeft(result)).toBe(true);
    });
  });
});
