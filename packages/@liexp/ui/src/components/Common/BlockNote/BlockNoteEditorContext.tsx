import { type BNESchemaEditor } from "@liexp/shared/lib/providers/blocknote/index.js";
import * as React from "react";

export const BlockNoteEditorContext =
  React.createContext<BNESchemaEditor | null>(null);
