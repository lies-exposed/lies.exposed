import { BlockNoteEditor } from "@blocknote/core";
import { fp } from "@liexp/core/lib/fp/index.js";
import { TaskEither } from "fp-ts/lib/TaskEither.js";
import { BNESchemaEditor, schema } from "../EditorSchema.js";
import { PARAGRAPH_TYPE } from "./customSlate.js";
import {
  SlateValue,
  isValidSlateValue,
  transform as transformSlate,
} from "./slate.utils.js";

export const deserializeSlatePluginToBlockNoteEditor = (p: {
  type: string;
  children?: { text: string }[];
}) => {
  if (p.type === PARAGRAPH_TYPE) {
    return fp.O.some(
      (p.children ?? []).map((c: any) => ({
        type: "paragraph",
        content: c.text,
      })),
    );
  }
  return fp.O.none;
};

export const fromSlateToBlockNote = (
  v: SlateValue,
): BNESchemaEditor["document"] | null => {
  if (isValidSlateValue(v)) {
    return (
      (transformSlate(v, deserializeSlatePluginToBlockNoteEditor) as any[]) ??
      null
    );
  }
  return v as any;
};

export const toInitialValue = (v: unknown): { initialContent?: any[] } => {
  if (typeof v === "string") {
    return {
      initialContent: v
        .split("\n")
        .map((v) => ({ type: "paragraph", content: v })),
    };
  }
  if (isValidSlateValue(v)) {
    const result = fromSlateToBlockNote(v);
    return result ? { initialContent: result } : {};
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
