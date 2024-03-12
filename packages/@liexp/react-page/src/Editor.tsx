import { importDefault } from "@liexp/core/lib/esm/import-default.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import _RPEditor, {
  type EditorProps as RPEditorProps,
  type Cell,
  type I18nField,
  type Row,
  type Value,
} from "@react-page/editor/lib/index.js";
import { SlateCellPlugin } from "@react-page/plugins-slate";
import * as React from "react";
import { getTextContents } from "./utils.js";

type I18nEnField = I18nField<Record<string, any>>;

const RPEditor = importDefault(_RPEditor).default;
export interface EditorProps extends RPEditorProps {
  slate: SlateCellPlugin<any>;
}

const Editor: React.FC<EditorProps> = ({
  slate,
  value,
  onChange,
  ...props
}) => {
  const [open, setOpen] = React.useState(false);

  const handleChange = (v: Value): void => {
    const lastChar = pipe(
      pipe(
        v.rows,
        fp.A.last,
        fp.O.map((r): Row[] => {
          const cells = pipe(
            r.cells,
            fp.A.last,
            fp.O.map((c: Cell) => [
              {
                ...c,
                dataI18n: c.dataI18n?.en?.slate
                  ? {
                      en: pipe(
                        c.dataI18n.en.slate as any[],
                        fp.A.last,
                        fp.O.map((c) => ({
                          slate: [{ ...c, children: [c.children[0]] }],
                        })),
                        fp.O.getOrElse((): I18nEnField => ({ slate: [] })),
                      ),
                    }
                  : c.dataI18n,
              },
            ]),
            fp.O.getOrElse((): Row["cells"] => []),
          );

          return [{ ...r, cells }];
        }),
        fp.O.getOrElse((): Row[] => []),
      ),
      (rows) =>
        getTextContents(slate)({
          ...v,
          rows,
        }),
    );

    if (lastChar === "/") {
      if (!open) {
        setOpen(true);
      }
    } else {
      if (open) {
        setOpen(false);
      }
      onChange?.(v);
    }
  };

  // console.log({ value })
  return <RPEditor value={value} onChange={handleChange} {...props}></RPEditor>;
};

export default Editor;
