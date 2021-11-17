import type { EditorProps, Value } from "@react-page/editor";
import RPEditor from "@react-page/editor";
import "@react-page/editor/lib/index.css";
import image from "@react-page/plugins-image";
import "@react-page/plugins-image/lib/index.css";
import slate from "@react-page/plugins-slate";
import "@react-page/plugins-slate/lib/index.css";
import * as React from "react";

// Define which plugins we want to use.
export const cellPlugins = [slate(), image] as any[];

const Editor: React.FC<Omit<EditorProps, "cellPlugins">> = (props) => {
  const [value, setValue] = React.useState<Value | null>(props.value as any);

  return (
    <RPEditor cellPlugins={cellPlugins} value={value} onChange={setValue} />
  );
};

export default Editor;
