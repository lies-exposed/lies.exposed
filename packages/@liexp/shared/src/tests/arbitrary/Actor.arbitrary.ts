import { propsOmit } from "@liexp/core/lib/io/utils.js";
import * as tests from "@liexp/test";
import * as t from "io-ts";
import * as http from "../../io/http/index.js";
import { formatDate } from "../../utils/date.utils.js";
import { HumanReadableStringArb } from "./HumanReadableString.arbitrary.js";
import { MediaArb } from "./Media.arbitrary.js";
import { ColorArb } from "./common/Color.arbitrary.js";
import { UUIDArb } from "./common/UUID.arbitrary.js";

export type ActorArbType = Omit<http.Actor.Actor, "bornOn" | "diedOn"> & {
  memberIn: any[];
  bornOn: string;
  diedOn: undefined;
};

export const ActorArb: tests.fc.Arbitrary<ActorArbType> = tests
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
        "deletedAt",
        "bornOn",
        "diedOn",
        "avatar",
      ]),
    ),
  )
  .map((p) => ({
    ...p,
    id: tests.fc.sample(UUIDArb, 1)[0],
    fullName: tests.fc.sample(HumanReadableStringArb({ count: 4 }), 1)[0],
    username: tests.fc.sample(
      HumanReadableStringArb({ count: 4, joinChar: "-" }),
    )[0],
    color: tests.fc.sample(ColorArb, 1)[0],
    avatar: tests.fc.sample(MediaArb, 1)[0],
    excerpt: null,
    memberIn: [],
    body: null,
    death: undefined,
    bornOn: formatDate(new Date()),
    diedOn: undefined,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: undefined,
  }));
