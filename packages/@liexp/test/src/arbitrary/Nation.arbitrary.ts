import * as http from "@liexp/shared/lib/io/http/index.js";
import { Arbitrary, Schema } from "effect";
import fc from "fast-check";
import { UUIDArb } from "./common/UUID.arbitrary.js";

export const NationArb: fc.Arbitrary<http.Nation.Nation> = Arbitrary.make(
  Schema.Struct(
    http.Nation.Nation.omit(
      "id",
      "actors",
      "createdAt",
      "updatedAt",
      "deletedAt",
    ).fields,
  ),
).map((p) => ({
  ...p,
  id: fc.sample(UUIDArb, 1)[0],
  name: fc.sample(fc.lorem({ maxCount: 3 }), 1)[0],
  isoCode: fc.sample(
    fc.stringMatching(/^[A-Z]{2}$/).filter((s) => s.length === 2),
    1,
  )[0],
  actors: [],
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: undefined,
}));
