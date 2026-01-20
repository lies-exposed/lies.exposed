import {
  useBlockNoteEditor,
  useComponentsContext,
  useSelectedBlocks,
} from "@blocknote/react";
import { type UUID } from "@liexp/io/lib/http/Common/UUID.js";
import { type ResourcesNames } from "@liexp/io/lib/http/ResourcesNames.js";
import { type BNESchemaEditor } from "@liexp/shared/lib/providers/blocknote/index.js";
import * as React from "react";
import { useAPIAgent } from "../../../../../hooks/useAPIAgent.js";
import {
  Box,
  CircularProgress,
  IconButton,
  Icons,
  Popover,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "../../../../mui/index.js";

export interface AIInstructionPopoverProps {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
  selectedText: string;
  onSubmit: (instruction: string) => Promise<void>;
}

const AIInstructionPopover: React.FC<AIInstructionPopoverProps> = ({
  anchorEl,
  open,
  onClose,
  selectedText,
  onSubmit,
}) => {
  const [instruction, setInstruction] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = async (): Promise<void> => {
    if (!instruction.trim()) return;
    setIsLoading(true);
    try {
      await onSubmit(instruction);
      setInstruction("");
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent): void => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSubmit();
    }
    if (e.key === "Escape") {
      onClose();
    }
  };

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "left",
      }}
      transformOrigin={{
        vertical: "top",
        horizontal: "left",
      }}
    >
      <Box sx={{ p: 2, width: 350 }}>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          AI Instruction
        </Typography>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ mb: 2, display: "block" }}
        >
          Selected: &quot;{selectedText.slice(0, 50)}
          {selectedText.length > 50 ? "..." : ""}&quot;
        </Typography>
        <Stack direction="row" spacing={1} alignItems="flex-end">
          <TextField
            autoFocus
            fullWidth
            multiline
            maxRows={3}
            size="small"
            placeholder="e.g., Summarize this, Translate to Italian, Fix grammar..."
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
          />
          <IconButton
            onClick={() => void handleSubmit()}
            disabled={!instruction.trim() || isLoading}
            color="primary"
            size="small"
          >
            {isLoading ? <CircularProgress size={20} /> : <Icons.Send />}
          </IconButton>
        </Stack>
      </Box>
    </Popover>
  );
};

export interface AIInstructionButtonProps {
  resource: ResourcesNames;
  resourceId: UUID;
}

export const AIInstructionButton: React.FC<AIInstructionButtonProps> = ({
  resource,
  resourceId,
}) => {
  const editor = useBlockNoteEditor<
    BNESchemaEditor["schema"]["blockSchema"],
    BNESchemaEditor["schema"]["inlineContentSchema"],
    BNESchemaEditor["schema"]["styleSchema"]
  >();

  const Components = useComponentsContext();
  const selectedBlocks = useSelectedBlocks(editor);
  const api = useAPIAgent();

  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);

  const getSelectedText = React.useCallback((): string => {
    const selection = editor.getSelection();
    if (!selection) return "";

    const selectedContent = selection.blocks
      .map((block) => {
        if ("content" in block && Array.isArray(block.content)) {
          return block.content
            .map((item) => {
              if ("text" in item && typeof item.text === "string") {
                return item.text;
              }
              return "";
            })
            .join("");
        }
        return "";
      })
      .join("\n");

    return selectedContent;
  }, [editor]);

  const handleClick = (event: React.MouseEvent<Element>): void => {
    setAnchorEl(event.currentTarget as HTMLElement);
  };

  const handleClose = (): void => {
    setAnchorEl(null);
  };

  const handleSubmit = async (instruction: string): Promise<void> => {
    const selectedText = getSelectedText();
    if (!selectedText) return;

    const result = await api.sendMessage({
      message: `{{ resource: ${resource}, resourceId: ${resourceId} }}${instruction}\n\n${selectedText}`,
      conversation_id: null,
    });

    const blocks = editor.tryParseMarkdownToBlocks(result.message.content);

    // Replace selected text with AI result
    const selection = editor.getSelection();
    if (selection && selection.blocks.length > 0) {
      // Update the first selected block with the AI result
      editor.replaceBlocks(selection.blocks, blocks);

      // If multiple blocks were selected, remove the rest
      if (selection.blocks.length > 1) {
        const blocksToRemove = selection.blocks.slice(1);
        editor.removeBlocks(blocksToRemove);
      }
    }
  };

  // Only show if there's a selection with content
  const hasSelection = selectedBlocks.length > 0;
  const selectedText = getSelectedText();

  if (!Components || !hasSelection || !selectedText) {
    return null;
  }

  return (
    <>
      <Tooltip title="AI Instruction">
        <Components.FormattingToolbar.Button
          mainTooltip="AI Instruction"
          onClick={handleClick}
          isSelected={Boolean(anchorEl)}
        >
          <Icons.AutoAwesome fontSize="small" />
        </Components.FormattingToolbar.Button>
      </Tooltip>
      <AIInstructionPopover
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        selectedText={selectedText}
        onSubmit={handleSubmit}
      />
    </>
  );
};
