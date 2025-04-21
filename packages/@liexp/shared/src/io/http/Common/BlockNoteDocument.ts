import { Schema } from "effect";

export const BlockNoteBlock = Schema.Struct({
  type: Schema.Any,
  id: Schema.String,
  props: Schema.Any,
  content: Schema.Any,
  children: Schema.mutable(Schema.Array(Schema.Any)),
}).annotations({ title: "BlockNoteBlock" });

export type BlockNoteBlock = typeof BlockNoteBlock.Type;

export const BlockNoteDocument = Schema.mutable(Schema.Array(BlockNoteBlock))
  .pipe(Schema.filter((s) => s.length >= 1 && typeof s[0].type === "string"))
  .pipe(Schema.brand("BlockNoteDocument"));

export type BlockNoteDocument = typeof BlockNoteDocument.Type;
