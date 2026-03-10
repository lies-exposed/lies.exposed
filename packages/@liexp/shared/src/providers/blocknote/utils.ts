import {
  BlockNoteDocument,
  type BlockNoteBlock,
} from "@liexp/io/lib/http/Common/BlockNoteDocument.js";
import { uuid } from "@liexp/io/lib/http/Common/UUID.js";
import { Schema } from "effect";
import * as NEA from "fp-ts/lib/NonEmptyArray.js";
import { pipe } from "fp-ts/lib/function.js";
import { getTextContents } from "./getTextContents.js";
import { type BNBlock } from "./type.js";

const toContent = (v: string) => ({
  type: "text" as const,
  text: v,
  content: v,
  styles: {},
});

export const toParagraph = (v: string): BNBlock => {
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

const toInitialValueS = (value: string): BlockNoteDocument => {
  const splits = value.split("\n") as NEA.NonEmptyArray<string>;
  return pipe(
    splits,
    NEA.map((v): BlockNoteBlock => toParagraph(v)),
  ) as unknown as BlockNoteDocument;
};

function toInitialValue(v: string): BlockNoteDocument;
function toInitialValue(v: unknown): BlockNoteDocument | undefined;
function toInitialValue(v: any): BlockNoteDocument | undefined {
  if (typeof v === "string" && v !== "") {
    return toInitialValueS(v);
  }

  if (Array.isArray(v) && Schema.is(BlockNoteDocument)(v)) {
    return v;
  }

  return undefined;
}

export { toInitialValue };

/**
 * Schema.transform that converts a plain-text string into a BlockNoteDocument
 * (one paragraph per newline) and encodes it back to plain text.
 *
 * Useful in CLI/MCP input schemas where the user provides a string but the API
 * expects a BlockNoteDocument.
 */
export const StringToBlockNoteDocument = Schema.transform(
  Schema.String,
  Schema.typeSchema(BlockNoteDocument),
  {
    strict: false,
    decode: (s) => toInitialValueS(s),
    encode: (doc) => getTextContents(doc as any),
  },
);
