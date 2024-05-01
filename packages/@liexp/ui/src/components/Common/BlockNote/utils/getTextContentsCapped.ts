import { BNESchemaEditor } from "../EditorSchema.js";
import { getTextContents } from "./getTextContents.js";
import { isValidValue } from "./isValidValue.js";

export const getTextContentsCapped = (
  blocks: BNESchemaEditor["document"],
  maxLength: number,
): string => {
  if (isValidValue(blocks)) {
    const text = getTextContents(blocks);
    return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
  }
  return "";
};
