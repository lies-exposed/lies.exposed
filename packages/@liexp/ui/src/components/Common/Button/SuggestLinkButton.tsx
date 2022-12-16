import AddLinkIcon from "@mui/icons-material/AddLink";
import * as React from "react";
import { SuggestLinkModal } from "../../Modal/SuggestLinkModal";
import { Box, IconButton } from "../../mui";

export interface SuggestLinkButtonProps {
  className?: string;
  color?: any;
}

const SuggestLinkButton: React.FC<SuggestLinkButtonProps> = ({
  className,
  color,
}) => {
  const [open, setOpen] = React.useState(false);
  const doClose = (): void => {
    setOpen(false);
  };

  return (
    <Box style={{ margin: 5 }}>
      <IconButton
        size="small"
        className={className}
        onClick={() => {
          setOpen(!open);
        }}
      >
        <AddLinkIcon color={color} />
      </IconButton>

      <SuggestLinkModal open={open} onClose={doClose} />
    </Box>
  );
};

export default SuggestLinkButton;
