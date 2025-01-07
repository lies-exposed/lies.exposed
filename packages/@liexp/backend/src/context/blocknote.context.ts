import { type ServerBlockNoteEditor } from "@liexp/shared/lib/providers/blocknote/ssr.js";

export interface BlockNoteContext {
  blocknote: ServerBlockNoteEditor;
}
