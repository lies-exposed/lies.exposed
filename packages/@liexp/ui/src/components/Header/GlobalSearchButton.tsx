import * as React from "react";
import {
  type SearchResult,
  GlobalSearchModal,
} from "../Common/Search/GlobalSearchModal.js";
import { Box, IconButton, Icons } from "../mui/index.js";

export interface GlobalSearchButtonProps {
  className?: string;
  /** Called when the user selects a result. The consumer is responsible for navigation. */
  onResultClick: (result: SearchResult) => void;
}

const GlobalSearchButton: React.FC<GlobalSearchButtonProps> = ({
  className,
  onResultClick,
}) => {
  const [open, setOpen] = React.useState(false);

  // Open on Ctrl+K / Cmd+K
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleClose = (): void => {
    setOpen(false);
  };

  const handleResultClick = (result: SearchResult): void => {
    setOpen(false);
    onResultClick(result);
  };

  return (
    <Box style={{ margin: 5 }}>
      <IconButton
        color="inherit"
        size="small"
        className={className}
        onClick={() => {
          setOpen(true);
        }}
        aria-label="Open global search (Ctrl+K)"
        title="Search (Ctrl+K)"
      >
        <Icons.Search />
      </IconButton>

      <GlobalSearchModal
        open={open}
        onClose={handleClose}
        onResultClick={handleResultClick}
      />
    </Box>
  );
};

export default GlobalSearchButton;
