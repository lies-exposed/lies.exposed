import * as React from "react";
import { type BNESchemaEditor } from "./EditorSchema.js";

export const BlockNoteEditorContext =
  React.createContext<BNESchemaEditor | null>(null);
