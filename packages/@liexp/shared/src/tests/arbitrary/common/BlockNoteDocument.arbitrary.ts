import * as tests from "@liexp/test/lib/index.js";
import {
  type BlockNoteBlock,
  type BlockNoteDocument,
} from "../../../io/http/Common/BlockNoteDocument.js";
import { toParagraph } from "../../../providers/blocknote/utils.js";

export const BlockNoteBlockArb: tests.fc.Arbitrary<BlockNoteBlock> = tests.fc
  .lorem()
  .map((block) => toParagraph(block));

export const BlockNoteDocumentArb: tests.fc.Arbitrary<BlockNoteDocument> =
  BlockNoteBlockArb.map((blocks) => [blocks] as BlockNoteDocument);
