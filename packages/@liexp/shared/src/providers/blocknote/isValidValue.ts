import type { BNEditorDocument } from "./type.js";

export const isValidValue = (v?: any): v is BNEditorDocument => {
  const valid = !!v && Array.isArray(v) && v.length > 0;

  return valid;
};
