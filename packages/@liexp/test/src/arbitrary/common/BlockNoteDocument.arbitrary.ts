import {
  type BlockNoteBlock,
  type BlockNoteDocument,
} from "@liexp/shared/lib/io/http/Common/BlockNoteDocument.js";
import { toParagraph } from "@liexp/shared/lib/providers/blocknote/utils.js";
import fc from "fast-check";

export const BlockNoteBlockArb: fc.Arbitrary<BlockNoteBlock> = fc
  .lorem()
  .map((block) => toParagraph(block));

export const BlockNoteDocumentArb: fc.Arbitrary<BlockNoteDocument> =
  BlockNoteBlockArb.map((blocks) => [blocks] as BlockNoteDocument);
