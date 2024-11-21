import { BlockNoteDocument } from "../../io/http/Common/BlockNoteDocument.js";
import { uuid } from "../../io/http/Common/UUID.js";
import { type BNBlock } from "./type.js";

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
    } as any,
    children: [],
    content: [content],
  };
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

  if (Array.isArray(v) && BlockNoteDocument.is(v)) {
    return v as unknown as BNBlock[];
  }

  return undefined;
}

export { toInitialValue };
