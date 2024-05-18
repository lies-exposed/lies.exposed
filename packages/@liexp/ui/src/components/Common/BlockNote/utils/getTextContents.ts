import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { BNESchemaEditor } from "../EditorSchema.js";
import { transform as transformBNDocument } from "./transform.utils.js";

export const getTextContents = (
  blocks: BNESchemaEditor["document"],
): string => {
  return pipe(
    transformBNDocument<string>(blocks, (p: any) => {
      if (p.type === "paragraph") {
        const textInContent =
          p.content?.map((c: any) => c.text ?? c.content) ?? [];

        return fp.O.some([...textInContent]);
      }

      if (p.type === "text") {
        return fp.O.some([p.text]);
      }
      return fp.O.none;
    }),
    (ss) => (ss === null ? "" : ss.join("\n")),
  );
};
