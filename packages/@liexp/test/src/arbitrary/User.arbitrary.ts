import * as User from "@liexp/io/lib/http/User.js";
import { Arbitrary } from "effect";
import fc from "fast-check";
import { UUIDArb } from "./common/UUID.arbitrary.js";

export const UserArb: fc.Arbitrary<User.User> = Arbitrary.make(User.User).map(
  (u) => ({
    ...u,
    id: fc.sample(UUIDArb, 1)[0],
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: undefined,
  }),
);
