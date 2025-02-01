import * as NEA from "fp-ts/lib/NonEmptyArray.js";
import { pipe } from "fp-ts/lib/function.js";
import { BlockNoteDocument } from "../../io/http/Common/BlockNoteDocument.js";
import { uuid } from "../../io/http/Common/UUID.js";
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
    NEA.map((v): BNBlock => toParagraph(v)),
  ) as unknown as BlockNoteDocument;
};

function toInitialValue(v: string): BlockNoteDocument;
function toInitialValue(v: unknown): BlockNoteDocument | undefined;
function toInitialValue(v: any): BlockNoteDocument | undefined {
  if (typeof v === "string" && v !== "") {
    return toInitialValueS(v);
  }

  if (Array.isArray(v) && BlockNoteDocument.is(v)) {
    return v;
  }

  return undefined;
}

export { toInitialValue };
