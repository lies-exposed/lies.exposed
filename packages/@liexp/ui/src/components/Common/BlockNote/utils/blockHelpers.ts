import { type BNESchemaEditor } from "@liexp/shared/lib/providers/blocknote/index.js";

// Helper function to replace insertOrUpdateBlockForSlashMenu
export function insertOrUpdateBlock(editor: BNESchemaEditor, block: any) {
  const selection = editor.getSelection();
  if (selection && selection.blocks.length > 0) {
    editor.insertBlocks([block], selection.blocks[0].id, "after");
  } else {
    // Get the current text cursor position and insert after that block
    const textCursorPosition = editor.getTextCursorPosition();
    editor.insertBlocks([block], textCursorPosition.block.id, "after");
  }
}