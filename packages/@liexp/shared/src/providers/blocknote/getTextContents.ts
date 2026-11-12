import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { transform as transformBNDocument } from "./transform.utils.js";
import { type BNBlock, type BNEditorDocument } from "./type.js";

/** Content item inside a BlockNote block's content array */
interface BNContentItem {
  text?: string;
  content?: string;
}

/** BlockNote block with type "text" */
interface BNTextBlock {
  type: "text";
  text: string;
}

export const getTextContents = (blocks: BNEditorDocument): string => {
  return pipe(
    transformBNDocument<string>(blocks, (p: BNBlock) => {
      if (p.type === "paragraph") {
        const textInContent =
          p.content?.map((c) => {
            const item = c as BNContentItem;
            return item.text ?? item.content ?? "";
          }) ?? [];

        return fp.O.some([...textInContent]);
      }

      if (p.type === "text") {
        return fp.O.some([(p as unknown as BNTextBlock).text ?? ""]);
      }
      return fp.O.none;
    }),
    (ss) => (ss === null ? "" : ss.join("\n")),
  );
};
