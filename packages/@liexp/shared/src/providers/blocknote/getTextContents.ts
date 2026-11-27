import { isValidValue } from "./isValidValue.js";
import { type BNEditorDocument } from "./type.js";

/** Shape shared by blocks and by the items of their content */
interface BNNode {
  type?: string;
  text?: string;
  content?: unknown;
  children?: BNNode[];
}

/** Text of an inline item: links hold their text in a nested content array */
const inlineText = (item: BNNode): string => {
  if (typeof item.text === "string") {
    return item.text;
  }
  if (typeof item.content === "string") {
    return item.content;
  }
  if (Array.isArray(item.content)) {
    return (item.content as BNNode[]).map(inlineText).join("");
  }
  return "";
};

const blockTexts = (block: BNNode): string[] => {
  if (block.type === "text") {
    return [block.text ?? ""];
  }

  const content = Array.isArray(block.content)
    ? (block.content as BNNode[]).map(inlineText)
    : [];

  return [...content, ...(block.children ?? []).flatMap(blockTexts)];
};

export const getTextContents = (blocks: BNEditorDocument): string => {
  if (!isValidValue(blocks)) {
    return "";
  }

  return (blocks as unknown as BNNode[]).flatMap(blockTexts).join("\n");
};
