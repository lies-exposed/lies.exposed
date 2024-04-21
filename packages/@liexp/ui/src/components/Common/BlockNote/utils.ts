import { BlockNoteEditor } from "@blocknote/core";
import { fp } from "@liexp/core/lib/fp/index.js";
import { PARAGRAPH_TYPE } from "@liexp/react-page/lib/customSlate.js";
import {
  DeserializeSlatePluginFN,
  isValidValue,
  transform,
} from "@liexp/react-page/lib/utils.js";
import { TaskEither } from "fp-ts/lib/TaskEither.js";
import { BNESchemaEditor, schema } from "./EditorSchema.js";

export const deserializeSlatePluginToBlockNoteEditor: DeserializeSlatePluginFN<
  any
> = (p) => {
  if (p.type === PARAGRAPH_TYPE) {
    return fp.O.some(
      ((p as any).children ?? []).map((c: any) => ({
        type: "paragraph",
        content: c.text,
      })),
    );
  }
  return fp.O.none;
};

export const fromSlateToBlockNote = (v: any): any => {
  if (isValidValue(v)) {
    return transform(v, deserializeSlatePluginToBlockNoteEditor);
  }
  return v;
};

export const toInitialValue = (v: any): any => {
  if (typeof v === "string") {
    return {
      initialContent: v
        .split("\n")
        .map((v) => ({ type: "paragraph", content: v })),
    };
  }
  if (isValidValue(v)) {
    return { initialContent: fromSlateToBlockNote(v) };
  }
  if (Array.isArray(v) && v.length > 0) {
    return { initialContent: v as any };
  }

  return {};
};

export const toBNDocument = async (
  v: unknown,
): Promise<BNESchemaEditor["document"] | null> => {
  const editor = BlockNoteEditor.create({ schema });

  if (typeof v === "string") {
    const result = await editor.tryParseHTMLToBlocks(v);
    return result;
  } else {
    const initialValue = toInitialValue(v);
    if (initialValue.initialContent) {
      return initialValue.initialContent;
    }
  }
  return Promise.resolve(null);
};

export const toBNDocumentTE = (
  v: any,
): TaskEither<Error, BNESchemaEditor["document"] | null> =>
  fp.TE.tryCatch(() => toBNDocument(v), fp.E.toError);
