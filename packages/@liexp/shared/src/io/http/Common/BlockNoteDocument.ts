import { type NonEmptyArray } from "fp-ts/lib/NonEmptyArray.js";
import * as t from "io-ts";
import { type NonEmptyArrayC } from "io-ts-types/lib/nonEmptyArray.js";

export interface BlockNoteDocumentBrand {
  readonly BlockNoteDocument: unique symbol;
}

export const BlockNoteBlock = t.strict(
  {
    type: t.any,
    id: t.string,
    props: t.any,
    content: t.any,
    children: t.array(t.any),
  },
  "BlockNoteBlock",
);

export type BlockNoteBlock = t.TypeOf<typeof BlockNoteBlock>;

export const BlockNoteDocument = t.brand<
  NonEmptyArrayC<typeof BlockNoteBlock>,
  "BlockNoteDocument",
  BlockNoteDocumentBrand
>(
  t.array(BlockNoteBlock) as any,
  (s): s is t.Branded<NonEmptyArray<BlockNoteBlock>, BlockNoteDocumentBrand> =>
    s.length >= 1 && typeof s[0].type === "string",
  "BlockNoteDocument",
);
export type BlockNoteDocument = t.TypeOf<typeof BlockNoteDocument>;
