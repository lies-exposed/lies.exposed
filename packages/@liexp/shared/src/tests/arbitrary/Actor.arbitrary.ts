import * as tests from "@liexp/core/tests";
import * as t from "io-ts";
import * as http from "../../io/http";
import { propsOmit } from "../../io/utils";
import { HumanReadableStringArb } from "./HumanReadableString.arbitrary";
import { placeKitten } from './Media.arbitrary';
import { ColorArb } from "./common/Color.arbitrary";

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
    color: tests.fc.sample(ColorArb, 1)[0],
    avatar: placeKitten(),
    excerpt: {},
    memberIn: [],
    body: {},
    death: undefined,
    createdAt: new Date(),
    updatedAt: new Date(),
  }));
