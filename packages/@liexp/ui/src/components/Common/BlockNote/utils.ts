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
  if (isValidValue(v)) {
    return { initialContent: fromSlateToBlockNote(v) };
  }
  if (Array.isArray(v) && v.length > 0) {
    return { initialContent: v as any };
  }

  return {};
};

export const toBNDocument = async (
  v: any,
): Promise<BNESchemaEditor["document"] | null> => {
  const initialValue = toInitialValue(v);
  console.log("initial value", initialValue);
  if (initialValue.initialContent) {
    const result = await schema.BlockNoteEditor.tryParseHTMLToBlocks(
      initialValue.initialContent,
    );
    console.log("parsed value", result);
    return result;
  }
  return Promise.resolve(null);
};

export const toBNDocumentTE = (
  v: any,
): TaskEither<Error, BNESchemaEditor["document"] | null> =>
  fp.TE.tryCatch(() => toBNDocument(v), fp.E.toError);
