import { propsOmit } from "@liexp/core/lib/io/utils";
import * as tests from "@liexp/test";
import * as t from "io-ts";
import * as http from "../../io/http";
import { formatDate } from "../../utils/date.utils";
import { HumanReadableStringArb } from "./HumanReadableString.arbitrary";
import { placeKitten } from "./Media.arbitrary";
import { ColorArb } from "./common/Color.arbitrary";

export const ActorArb: tests.fc.Arbitrary<
  http.Actor.Actor & { bornOn: undefined; diedOn: undefined; memberIn: any[] }
> = tests
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
        "bornOn",
        "diedOn",
      ]),
    ),
  )
  .map((p) => ({
    ...p,
    id: tests.fc.sample(tests.fc.uuidV(4), 1)[0] as any,
    fullName: tests.fc.sample(HumanReadableStringArb({ count: 4 }), 1)[0],
    username: tests.fc.sample(
      HumanReadableStringArb({ count: 4, joinChar: "-" }),
    )[0],
    color: tests.fc.sample(ColorArb, 1)[0],
    avatar: placeKitten(),
    excerpt: {},
    memberIn: [],
    body: {},
    death: undefined,
    bornOn: formatDate(new Date()) as any,
    diedOn: undefined,
    createdAt: new Date(),
    updatedAt: new Date(),
  }));
