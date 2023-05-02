import { fp } from "@liexp/core/lib/fp";
import { getTextContents } from "@liexp/shared/lib/slate";
import RPEditor, {
  type EditorProps,
  type Row,
  type Value,
} from "@react-page/editor";
import { pipe } from "fp-ts/lib/function";
import * as React from "react";
import { ComponentsPickerPopover } from "./ComponentPickerPopover";
import { cellPlugins } from "./cellPlugins";

const Editor: React.FC<Omit<EditorProps, "cellPlugins">> = ({
  value,
  onChange,
  ...props
}) => {
  const [open, setOpen] = React.useState(false);

  const handleChange = (v: Value): void => {
    const lastChar = getTextContents({
      ...v,
      rows: pipe(
        v.rows,
        fp.A.last,
        fp.O.map((r): Row[] => [r]),
        fp.O.getOrElse((): Row[] => [])
      ),
    });

    if (lastChar === "/") {
      setOpen(true);
    } else {
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
      <ComponentsPickerPopover
        open={open}
        onClose={() => {
          setOpen(false);
        }}
      />
    </RPEditor>
  );
};

export default Editor;
