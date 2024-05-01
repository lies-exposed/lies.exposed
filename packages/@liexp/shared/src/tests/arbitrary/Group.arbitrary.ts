import { propsOmit } from "@liexp/core/lib/io/utils.js";
import * as tests from "@liexp/test";
import * as t from "io-ts";
import * as http from "../../io/http/index.js";
import { HumanReadableStringArb } from "./HumanReadableString.arbitrary.js";
import { ColorArb } from "./common/Color.arbitrary.js";

export const GroupArb: tests.fc.Arbitrary<
  http.Group.Group & { members: any[] }
> = tests
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
    excerpt: undefined,
    body: undefined,
    startDate: new Date(),
    endDate: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  }));
