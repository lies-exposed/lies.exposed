import { type BNESchemaEditor } from "../EditorSchema.js";

export const isValidValue = (v?: any): v is BNESchemaEditor["document"] => {
  const valid = !!v && Array.isArray(v) && v.length > 0;

  return valid;
};
