import { propsOmit } from "@liexp/core/lib/io/utils.js";
import { fc, getArbitrary } from "@liexp/test";
import * as t from "io-ts";
import * as http from "../../io/http/index.js";
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
