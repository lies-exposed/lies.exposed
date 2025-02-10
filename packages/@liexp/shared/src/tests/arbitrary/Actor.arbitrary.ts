import { propsOmit } from "@liexp/core/lib/io/utils.js";
import * as tests from "@liexp/test";
import * as t from "io-ts";
import * as http from "../../io/http/index.js";
import { HumanReadableStringArb } from "./HumanReadableString.arbitrary.js";
import { MediaArb } from "./Media.arbitrary.js";
import { BlockNoteDocumentArb } from "./common/BlockNoteDocument.arbitrary.js";
import { ColorArb } from "./common/Color.arbitrary.js";
import { UUIDArb } from "./common/UUID.arbitrary.js";

export const ActorArb: tests.fc.Arbitrary<http.Actor.Actor> = tests
  .getArbitrary(
    t.strict(
      propsOmit(http.Actor.Actor, [
        "id",
        "color",
        "excerpt",
        "death",
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
    excerpt: tests.fc.sample(BlockNoteDocumentArb, 1)[0],
    memberIn: [],
    body: tests.fc.sample(
      tests.fc.oneof(tests.fc.constant(null), BlockNoteDocumentArb),
      1,
    )[0],
    death: undefined,
    bornOn: new Date(),
    diedOn: undefined,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: undefined,
  }));
