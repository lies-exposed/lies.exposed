import { getTextContents } from "./getTextContents.js";
import { isValidValue } from "./isValidValue.js";
import type { BNEditorDocument } from "./type.js";

export const getTextContentsCapped = (
  blocks: BNEditorDocument,
  maxLength: number,
): string => {
  if (isValidValue(blocks)) {
    const text = getTextContents(blocks);
    return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
  }
  return "";
};
