import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { transform as transformBNDocument } from "./transform.utils.js";
import { type BNBlock, type BNEditorDocument } from "./type.js";

export const getTextContents = (blocks: BNEditorDocument): string => {
  return pipe(
    transformBNDocument<string>(blocks, (p: BNBlock) => {
      if (p.type === "paragraph") {
        const textInContent =
          p.content?.map((c) => {
            const item = c as { text?: unknown; content?: unknown };
            return (item.text ?? item.content) as string;
          }) ?? [];

        return fp.O.some([...textInContent]);
      }

      if (p.type === "text") {
        return fp.O.some([(p as unknown as { text: string }).text ?? ""]);
      }
      return fp.O.none;
    }),
    (ss) => (ss === null ? "" : ss.join("\n")),
  );
};
