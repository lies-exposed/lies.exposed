import * as http from "@liexp/shared/lib/io/http/index.js";
import { Arbitrary, Schema } from "effect";
import fc from "fast-check";
import { HumanReadableStringArb } from "./HumanReadableString.arbitrary.js";
import { MediaArb } from "./Media.arbitrary.js";
import { BlockNoteDocumentArb } from "./common/BlockNoteDocument.arbitrary.js";
import { ColorArb } from "./common/Color.arbitrary.js";
import { UUIDArb } from "./common/UUID.arbitrary.js";

export const GroupArb: fc.Arbitrary<http.Group.Group> = Arbitrary.make(
  Schema.Struct(
    http.Group.Group.omit(
      "id",
      "body",
      "members",
      "color",
      "avatar",
      "excerpt",
      "body",
      "startDate",
      "endDate",
      "createdAt",
      "updatedAt",
      "deletedAt",
    ).fields,
  ),
).map((p) => ({
  ...p,
  id: fc.sample(UUIDArb, 1)[0],
  name: fc.sample(HumanReadableStringArb(), 1)[0],
  username: fc.sample(HumanReadableStringArb({ joinChar: "-" }), 1)[0],
  avatar: fc.sample(MediaArb, 1)[0],
  color: fc.sample(ColorArb, 1)[0],
  members: [],
  excerpt: fc.sample(fc.oneof(fc.constant(null), BlockNoteDocumentArb), 1)[0],
  body: fc.sample(fc.oneof(fc.constant(null), BlockNoteDocumentArb), 1)[0],
  startDate: new Date(),
  endDate: new Date(),
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: undefined,
}));
