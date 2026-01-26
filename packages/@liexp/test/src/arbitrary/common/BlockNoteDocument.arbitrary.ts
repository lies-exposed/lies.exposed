import {
  type BlockNoteBlock,
  type BlockNoteDocument,
  BlockNoteDocument as BlockNoteDocumentSchema,
} from "@liexp/io/lib/http/Common/BlockNoteDocument.js";
import { uuid } from "@liexp/io/lib/http/Common/UUID.js";
import { Schema } from "effect";
import fc from "fast-check";

const toContent = (v: string) => ({
  type: "text" as const,
  text: v,
  content: v,
  styles: {},
});

export const toParagraph = (v: string): BlockNoteBlock => {
  const content = toContent(v);
  return {
    id: uuid(),
    type: "paragraph",
    props: {
      textColor: "default",
      backgroundColor: "default",
      textAlignment: "left",
    },
    children: [],
    content: [content],
  };
};

export const BlockNoteBlockArb = (
  text?: string,
): fc.Arbitrary<BlockNoteBlock> => {
  const textArb = text ? fc.constant(text) : fc.lorem();
  return textArb.map((block) => toParagraph(block));
};

export const BlockNoteDocumentArb = (
  text?: string,
): fc.Arbitrary<BlockNoteDocument> =>
  BlockNoteBlockArb(text).map((block) =>
    Schema.decodeSync(BlockNoteDocumentSchema)([block]),
  );
