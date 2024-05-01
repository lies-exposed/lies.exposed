import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { BNESchemaEditor } from "../EditorSchema.js";
import { PARAGRAPH_TYPE } from "./customSlate.js";
import { transform as transformBNDocument } from "./transform.utils.js";

export const getTextContents = (
  blocks: BNESchemaEditor["document"],
): string => {
  return pipe(
    transformBNDocument(blocks, (p: any) => {
      if (p.type === PARAGRAPH_TYPE) {
        return fp.O.some(p.children?.map((c: any) => c.text));
      }
      return fp.O.none;
    }),
    (ss) => (ss === null ? "" : ss.join("\n")),
  );
};
