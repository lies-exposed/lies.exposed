import * as tests from "@liexp/core/tests";
import * as t from "io-ts";
import * as http from "../../io/http";
import { propsOmit } from "../../io/utils";
import { HumanReadableStringArb } from "./HumanReadableString.arbitrary";
import { ColorArb } from "./common/Color.arbitrary";

export const GroupArb: tests.fc.Arbitrary<http.Group.Group> = tests
  .getArbitrary(
    t.strict(
      propsOmit(http.Group.Group, [
        "id",
        "body",
        "members",
        "color",
        "excerpt",
        "body",
        "createdAt",
        "updatedAt",
      ])
    )
  )
  .map((p) => ({
    ...p,
    id: tests.fc.sample(tests.fc.uuidV(4), 1)[0] as any,
    name: tests.fc.sample(HumanReadableStringArb(), 1)[0],
    color: tests.fc.sample(ColorArb, 1)[0],
    members: [],
    excerpt: {},
    body: {},
    createdAt: new Date(),
    updatedAt: new Date(),
  }));
