import * as t from "io-ts";
import { nonEmptyArray } from "io-ts-types/lib/nonEmptyArray.js";

type BlockNoteDocument = { type: string }[];

export const BlockNoteDocument = new t.Type<BlockNoteDocument, any[], unknown>(
  "BlockNoteDocument",
  nonEmptyArray(t.type({ type: t.string })).is,
  (s, c) => {
    if (s instanceof Array) {
      if (s.length >= 1 && typeof s[0].type === "string") {
        return t.success(s);
      }
    }
    return t.failure(s, c);
  },
  t.identity,
);
