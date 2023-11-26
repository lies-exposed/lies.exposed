import { propsOmit } from "@liexp/core/lib/io/utils";
import * as tests from "@liexp/test";
import * as t from "io-ts";
import * as http from "../../io/http";
import { HumanReadableStringArb } from "./HumanReadableString.arbitrary";
import { ColorArb } from "./common/Color.arbitrary";

export const GroupArb: tests.fc.Arbitrary<http.Group.Group & { members: any[] }> = tests
  .getArbitrary(
    t.strict(
      propsOmit(http.Group.Group, [
        "id",
        "body",
        "members",
        "color",
        "excerpt",
        "body",
        "startDate",
        "endDate",
        "createdAt",
        "updatedAt",
      ]),
    ),
  )
  .map((p) => ({
    ...p,
    id: tests.fc.sample(tests.fc.uuidV(4), 1)[0] as any,
    name: tests.fc.sample(HumanReadableStringArb(), 1)[0],
    username: tests.fc.sample(HumanReadableStringArb({ joinChar: "-" }), 1)[0],
    color: tests.fc.sample(ColorArb, 1)[0],
    members: [],
    excerpt: {},
    body: {},
    startDate: new Date(),
    endDate: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  }));
