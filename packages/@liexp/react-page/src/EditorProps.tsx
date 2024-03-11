import { type EditorProps as RPEditorProps } from "@react-page/editor/lib/index.js";

export type LiexpEditorProps = Omit<RPEditorProps, "cellPlugins"> & {
  variant?: "plain" | "extended";
};
