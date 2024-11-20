import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { transform as transformBNDocument } from "./transform.utils.js";
import { type BNEditorDocument } from "./type.js";

export const getTextContents = (blocks: BNEditorDocument): string => {
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
