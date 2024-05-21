import { BlockNoteEditor } from "@blocknote/core";
import { fp } from "@liexp/core/lib/fp/index.js";
import { uuid } from "@liexp/shared/lib/utils/uuid.js";
import { TaskEither } from "fp-ts/lib/TaskEither.js";
import { BNESchemaEditor, schema, BNBlock } from "../EditorSchema.js";
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

const toInitialValueS = (value: string): BNBlock[] => {
  return value.split("\n").map((v) => ({
    id: uuid(),
    type: "paragraph",
    props: {
      textColor: "default",
      backgroundColor: "default",
      textAlignment: "left",
    },
    children: [],
    content: [{ type: "text", text: v, styles: {} }],
  })) as any[];
};

function toInitialValue(v: string): any[];
function toInitialValue(v: unknown): any[] | undefined;
function toInitialValue(v: any): any[] | undefined {
  if (typeof v === "string") {
    return toInitialValueS(v);
  }
  if (isValidSlateValue(v)) {
    const result = fromSlateToBlockNote(v);
    return result ? result : undefined;
  }
  if (Array.isArray(v) && v.length > 0) {
    return v as any[];
  }

  return undefined;
}

export { toInitialValue };

export const toInitialContent = (v: unknown): { initialContent?: any[] } => {
  const initialValue = toInitialValue(v);
  if (initialValue) {
    return { initialContent: initialValue };
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
    if (initialValue) {
      return initialValue;
    }
  }
  return Promise.resolve(null);
};

export const toBNDocumentTE = (
  v: any,
): TaskEither<Error, BNESchemaEditor["document"] | null> =>
  fp.TE.tryCatch(() => toBNDocument(v), fp.E.toError);
