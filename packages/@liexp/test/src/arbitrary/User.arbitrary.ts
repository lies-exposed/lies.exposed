import { propsOmit } from "@liexp/core/lib/io/utils.js";
import * as http from "@liexp/shared/lib/io/http/index.js";
import fc from "fast-check";
import { getArbitrary } from "fast-check-io-ts";
import * as t from "io-ts";
import { UUIDArb } from "./common/UUID.arbitrary.js";

const userProps = propsOmit(http.User.User, [
  "id",
  "createdAt",
  "updatedAt",
  "deletedAt",
]);
export const UserArb: fc.Arbitrary<http.User.User> = getArbitrary(
  t.strict({ ...userProps }),
).map((u) => ({
  ...u,
  id: fc.sample(UUIDArb, 1)[0],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  deletedAt: undefined,
}));
