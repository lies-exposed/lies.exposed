import { fp } from "@liexp/core/lib/fp";
import { type Cell, type Row, type Value } from "@react-page/editor";
import { type Option } from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { jsx } from "slate-hyperscript";

const deserialize = (el: ChildNode | null): any => {
  if (el === null) {
    return null;
  }

  if (el.nodeType === 3) {
    return el.textContent;
  } else if (el.nodeType !== 1) {
    return null;
  }

  let children = Array.from(el.childNodes).map(deserialize);

  if (children.length === 0) {
    children = [{ text: "" }];
  }

  switch (el.nodeName) {
    case "BODY":
      return jsx("fragment", {}, children);
    case "A":
      return jsx("element", {
        type: "link",
        url: (el as any).getAttribute("href"),
      });
    case "BR":
      return "\n";
    case "BLOCKQUOTE":
      return jsx("element", { type: "quote" }, children);
    case "P":
      return jsx("element", { type: "paragraph" }, children);
    case "UL":
      return jsx("element", { type: "bulleted-list" }, children);
    case "LI":
      return jsx("element", { type: "list-item" }, children);
    // text tags
    case "CODE":
      return jsx("text", { code: true });
    case "STRONG":
      return jsx("text", { bold: true });
    default:
      // eslint-disable-next-line no-console
      console.log(el.nodeName);
      return null;
  }
};

export default deserialize;

export const deserializeFromString = (html?: string): any => {
  if (html === undefined) {
    return undefined;
  }
  const el = new DOMParser().parseFromString(html, "text/html");
  const result = deserialize(el.body);

  return result;
};

export function transform<T>(
  v: Value,
  f: (c: Cell) => Option<T[]>
): T[] | null {
  const deserializeRow = (r: Row): T[] => {
    return pipe(r.cells, fp.A.map(f), fp.A.compact, fp.A.flatten);
  };

  if (v.rows.length === 0) {
    return null;
  }

  return pipe(v.rows, fp.A.map(deserializeRow), fp.A.flatten);
}
