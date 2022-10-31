import { fc, getArbitrary } from "@liexp/core/tests";
import * as t from "io-ts";
import * as http from "../../io/http";
import { propsOmit } from "../../io/utils";

const userProps = propsOmit(http.User.User, ["id", "createdAt", "updatedAt"]);
export const UserArb: fc.Arbitrary<http.User.User> = getArbitrary(
  t.strict({ ...userProps })
).map((u) => ({
  ...u,
  id: fc.sample(fc.uuid(), 1)[0] as any,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}));
