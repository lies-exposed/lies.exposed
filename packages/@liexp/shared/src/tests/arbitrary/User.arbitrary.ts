import { propsOmit } from "@liexp/core/lib/io/utils.js";
import { fc, getArbitrary } from "@liexp/test";
import * as t from "io-ts";
import * as http from "../../io/http/index.js";

const userProps = propsOmit(http.User.User, ["id", "createdAt", "updatedAt"]);
export const UserArb: fc.Arbitrary<http.User.User> = getArbitrary(
  t.strict({ ...userProps }),
).map((u) => ({
  ...u,
  id: fc.sample(fc.uuid(), 1)[0] as any,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}));
