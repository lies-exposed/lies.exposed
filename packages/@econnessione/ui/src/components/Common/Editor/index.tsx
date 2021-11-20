import type { EditorProps, Value } from "@react-page/editor";
import RPEditor from "@react-page/editor";
import "@react-page/editor/lib/index.css";
import background from "@react-page/plugins-background";
import "@react-page/plugins-background/lib/index.css";
import divider from "@react-page/plugins-divider";
import "@react-page/plugins-divider/lib/index.css";
import html5Video from "@react-page/plugins-html5-video";
import "@react-page/plugins-html5-video/lib/index.css";
import image from "@react-page/plugins-image";
import "@react-page/plugins-image/lib/index.css";
import "@react-page/plugins-slate/lib/index.css";
import spacer from "@react-page/plugins-spacer";
import "@react-page/plugins-spacer/lib/index.css";
import video from "@react-page/plugins-video";
import "@react-page/plugins-video/lib/index.css";
import * as React from "react";
import customSlate from "./plugins/customSlate";
import gridCellPlugin from "./plugins/gridCellPlugin";

// Define which plugins we want to use.
export const cellPlugins = [
  customSlate,
  background({}),
  image,
  spacer,
  divider,
  video,
  html5Video,
  gridCellPlugin,
] as any[];

const Editor: React.FC<Omit<EditorProps, "cellPlugins">> = ({
  value: initialValue,
  ...props
}) => {
  const [value, setValue] = React.useState<Value | null>(initialValue as any);

  return (
    <RPEditor
      cellPlugins={cellPlugins}
      value={value}
      onChange={setValue}
      {...props}
    />
  );
};

export default Editor;
