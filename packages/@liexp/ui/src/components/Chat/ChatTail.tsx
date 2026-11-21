import React from "react";
import { Box, Button, Icons } from "../mui/index.js";

/** Sticky pill shown when the user scrolled up while new content arrives. */
export const JumpToLatest: React.FC<{ onClick: () => void }> = ({
  onClick,
}) => (
  <Box
    sx={{
      position: "sticky",
      bottom: 0,
      alignSelf: "center",
      zIndex: 1,
    }}
  >
    <Button
      size="small"
      variant="contained"
      startIcon={<Icons.ArrowDown fontSize="small" />}
      onClick={onClick}
    >
      Jump to latest
    </Button>
  </Box>
);

/** Re-run the last user message after an assistant reply. */
export const RegenerateButton: React.FC<{ onClick: () => void }> = ({
  onClick,
}) => (
  <Box sx={{ display: "flex", justifyContent: "flex-start", pl: 1 }}>
    <Button
      size="small"
      variant="text"
      startIcon={<Icons.Refresh fontSize="small" />}
      onClick={onClick}
    >
      Regenerate
    </Button>
  </Box>
);
