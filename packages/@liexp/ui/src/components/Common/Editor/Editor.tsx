import { fp } from "@liexp/core/lib/fp/index.js";
import { getTextContents } from "@liexp/shared/lib/slate/index.js";
import RPEditor, {
  type Cell,
  type EditorProps,
  type I18nField,
  type Row,
  type Value,
} from "@react-page/editor/lib-es/index.js";
import { pipe } from "fp-ts/lib/function.js";
import * as React from "react";
import { cellPlugins } from "./cellPlugins.js";

type I18nEnField = I18nField<Record<string, any>>;

const Editor: React.FC<Omit<EditorProps, "cellPlugins">> = ({
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
        getTextContents({
          ...v,
          rows,
        }),
    );

    // console.log({ lastChar });

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
  return (
    <RPEditor
      cellPlugins={cellPlugins}
      value={value}
      onChange={handleChange}
      {...props}
    >
      {/* <ComponentsPickerPopover
        open={open}
        onClose={() => {
          setOpen(false);
        }}
      /> */}
    </RPEditor>
  );
};

export default Editor;
