import { getTextContents } from "./getTextContents";
import { isValidValue } from "./isValidValue";
import type { BNEditorDocument } from "./type";

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
