import * as http from "@liexp/shared/lib/io/http/index.js";
import { Arbitrary, Schema } from "effect";
import fc from "fast-check";
import { HumanReadableStringArb } from "./HumanReadableString.arbitrary.js";
import { MediaArb } from "./Media.arbitrary.js";
import { BlockNoteDocumentArb } from "./common/BlockNoteDocument.arbitrary.js";
import { ColorArb } from "./common/Color.arbitrary.js";
import { UUIDArb } from "./common/UUID.arbitrary.js";

export const ActorArb: fc.Arbitrary<http.Actor.Actor> = Arbitrary.make(
  Schema.Struct(
    http.Actor.Actor.omit(
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
    ).fields,
  ),
).map((p) => ({
  ...p,
  id: fc.sample(UUIDArb, 1)[0],
  fullName: fc.sample(HumanReadableStringArb({ count: 4 }), 1)[0],
  username: fc.sample(HumanReadableStringArb({ count: 4, joinChar: "-" }))[0],
  color: fc.sample(ColorArb, 1)[0],
  avatar: fc.sample(MediaArb, 1)[0],
  excerpt: fc.sample(BlockNoteDocumentArb, 1)[0],
  memberIn: [],
  body: fc.sample(fc.oneof(fc.constant(null), BlockNoteDocumentArb), 1)[0],
  death: undefined,
  bornOn: new Date(),
  diedOn: undefined,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: undefined,
}));
