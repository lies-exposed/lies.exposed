import * as http from "@liexp/io/lib/http/index.js";
import { Arbitrary } from "effect";
import fc from "fast-check";
import { HumanReadableStringArb } from "./HumanReadableString.arbitrary";
import { BlockNoteDocumentFromText } from "./common/BlockNoteDocument.arbitrary";

export const PageArb: fc.Arbitrary<http.Page.Page> = Arbitrary.make(
  http.Page.Page,
).map((p) => ({
  ...p,
  path: fc
    .sample(HumanReadableStringArb({ count: 5 }), 1)
    .reduce((acc, s) => acc.concat(s), ""),
  title: fc
    .sample(HumanReadableStringArb({ count: 10 }), 1)
    .reduce((acc, s) => acc.concat(s), ""),
  excerpt: fc.sample(
    HumanReadableStringArb({ count: 40 }).chain(BlockNoteDocumentFromText),
  ),
  body2: fc.sample(
    HumanReadableStringArb({ count: 100 }).chain(BlockNoteDocumentFromText),
  ),
  deletedAt: undefined,
}));
