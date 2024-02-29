import { type SlateCellPlugin } from "@react-page/plugins-slate";
import * as React from "react";
import { type LiexpEditorProps } from "./EditorProps.js";
import { type Value } from "./react-page.types.js";

export interface LiexpEditor {
  Editor: React.FC<LiexpEditorProps>;
  LazyEditor: React.FC<LiexpEditorProps>;
  liexpSlate: SlateCellPlugin<any>;
  createExcerptValue: (text: string) => Value;
  getTextContents: (v: Value, j?: string) => string;
  getTextContentsCapped: (v: Value, end: number) => string;
}
