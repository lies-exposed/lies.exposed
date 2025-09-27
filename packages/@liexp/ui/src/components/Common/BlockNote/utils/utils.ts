import { BlockNoteEditor } from "@blocknote/core";
import { fp } from "@liexp/core/lib/fp/index.js";
// import {
//   type BNBlock,
//   type BNEditorDocument,
//   type BNESchemaEditor,
// } from "@liexp/shared/lib/providers/blocknote/index.js";
import { type BlockNoteDocument } from "@liexp/shared/lib/io/http/Common/BlockNoteDocument.js";
import { toInitialValue } from "@liexp/shared/lib/providers/blocknote/utils.js";
import { type TaskEither } from "fp-ts/lib/TaskEither.js";
import { schema } from "../EditorSchema.js";

export const toInitialContent = (
  v: unknown,
): { initialContent?: BlockNoteDocument } => {
  const initialValue = toInitialValue(v);
  if (initialValue) {
    return { initialContent: initialValue };
  }
  return {};
};

export const toBNDocument = async (
  v: unknown,
): Promise<BlockNoteDocument | null> => {
  const editor = BlockNoteEditor.create({ schema });

  if (typeof v === "string") {
    const result = editor.tryParseHTMLToBlocks(v);
    return result as unknown as BlockNoteDocument;
  } else {
    const initialValue = toInitialValue(v);
    if (initialValue) {
      return initialValue as unknown as BlockNoteDocument;
    }
  }
  return Promise.resolve(null);
};

export const toBNDocumentTE = (
  v: unknown,
): TaskEither<Error, BlockNoteDocument | null> =>
  fp.TE.tryCatch(() => toBNDocument(v), fp.E.toError);
