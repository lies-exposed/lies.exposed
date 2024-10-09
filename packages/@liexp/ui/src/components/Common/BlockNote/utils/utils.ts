import { BlockNoteEditor } from "@blocknote/core";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { BlockNoteDocument } from "@liexp/shared/lib/io/http/Common/BlockNoteDocument.js";
import { uuid } from "@liexp/shared/lib/io/http/Common/UUID.js";
import { type Option } from "fp-ts/lib/Option.js";
import { type TaskEither } from "fp-ts/lib/TaskEither.js";
import {
  type BNESchemaEditor,
  schema,
  type BNBlock,
  type BNEditorDocument,
} from "../EditorSchema.js";
import { PARAGRAPH_TYPE } from "./customSlate.js";
import {
  type SlateValue,
  isValidSlateValue,
  transform as transformSlate,
} from "./slate.utils.js";

const toContent = (v: string) => ({
  type: "text" as const,
  text: v,
  styles: {},
});

const toParagraph = (v: string): BNBlock => {
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

const extractText = (v: undefined | string): string[] => {
  if (v === undefined) {
    return [];
  }
  return v.split("\n").filter((v) => v !== "");
};

export const deserializeSlatePluginToBlockNoteEditor = (p: {
  type: string;
  children?: { text: string }[];
}): Option<BNBlock[]> => {
  if (p.type === PARAGRAPH_TYPE) {
    return pipe(
      p.children ?? [],
      fp.A.chain((v) => {
        const chunks = extractText(v.text);
        if (chunks.length === 0) {
          return [];
        }
        return [
          {
            ...toParagraph(chunks[0]),
            content: chunks.map((v) => toContent(v)),
          } as BNBlock,
        ];
      }),
      fp.O.fromPredicate(fp.A.isNonEmpty),
    );
  }
  return fp.O.none;
};

export const formatSlateToBlockNoteValue = (
  v: SlateValue,
): BNEditorDocument | null => {
  if (isValidSlateValue(v)) {
    return transformSlate(v, deserializeSlatePluginToBlockNoteEditor) ?? null;
  }
  return v;
};

const toInitialValueS = (value: string): BNBlock[] => {
  return value.split("\n").map((v): BNBlock => toParagraph(v));
};

function toInitialValue(v: string): BNBlock[];
function toInitialValue(v: unknown): BNBlock[] | undefined;
function toInitialValue(v: any): BNBlock[] | undefined {
  if (typeof v === "string" && v !== "") {
    return toInitialValueS(v);
  }

  if (isValidSlateValue(v)) {
    const result = formatSlateToBlockNoteValue(v);
    return result ? result : undefined;
  }

  if (Array.isArray(v) && BlockNoteDocument.is(v)) {
    return v as unknown as BNBlock[];
  }

  return undefined;
}

export { toInitialValue };

export const toInitialContent = (
  v: unknown,
): { initialContent?: BNBlock[] } => {
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
  v: unknown,
): TaskEither<Error, BNESchemaEditor["document"] | null> =>
  fp.TE.tryCatch(() => toBNDocument(v), fp.E.toError);
