import * as tests from "@econnessione/core/tests";
import * as t from "io-ts";
import * as http from "../../io/http";
import { HumanReadableStringArb } from "./HumanReadableString.arbitrary";
import { propsOmit } from "./utils.arbitrary";

export const ActorArb: tests.fc.Arbitrary<http.Actor.Actor> = tests
  .getArbitrary(
    t.strict(
      propsOmit(http.Actor.Actor, [
        "id",
        "color",
        "death",
        "excerpt",
        "body",
        "memberIn",
        "createdAt",
        "updatedAt",
      ])
    )
  )
  .map((p) => ({
    ...p,
    id: tests.fc.sample(tests.fc.uuidV(4), 1)[0] as any,
    fullName: tests.fc.sample(HumanReadableStringArb(), 1)[0],
    username: tests.fc.sample(HumanReadableStringArb({ joinChar: "-" }))[0],
    color: tests.fc
      .sample(tests.fc.hexaString({ maxLength: 6, minLength: 6 }), 1)[0]
      .substring(0, 6) as any,
    excerpt: {},
    memberIn: [],
    body: {},
    death: undefined,
    createdAt: new Date(),
    updatedAt: new Date(),
  }));
