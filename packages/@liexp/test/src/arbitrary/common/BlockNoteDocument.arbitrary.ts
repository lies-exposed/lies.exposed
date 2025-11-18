import {
  type BlockNoteBlock,
  type BlockNoteDocument,
  BlockNoteDocument as BlockNoteDocumentSchema,
} from "@liexp/shared/lib/io/http/Common/BlockNoteDocument.js";
import { toParagraph } from "@liexp/shared/lib/providers/blocknote/utils.js";
import { Schema } from "effect";
import fc from "fast-check";

export const BlockNoteBlockArb: fc.Arbitrary<BlockNoteBlock> = fc
  .lorem()
  .map((block) => toParagraph(block));

export const BlockNoteDocumentArb: fc.Arbitrary<BlockNoteDocument> =
  BlockNoteBlockArb.map((block) =>
    Schema.decodeSync(BlockNoteDocumentSchema)([block]),
  );
