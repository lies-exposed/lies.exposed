import * as http from "@liexp/shared/lib/io/http/index.js";
import { Arbitrary } from "effect";
import fc from "fast-check";
import { UUIDArb } from "./common/UUID.arbitrary.js";

export const UserArb: fc.Arbitrary<http.User.User> = Arbitrary.make(
  http.User.User,
).map((u) => ({
  ...u,
  id: fc.sample(UUIDArb, 1)[0],
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: undefined,
}));
