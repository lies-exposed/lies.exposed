import React from "react";
import { styled } from "../../../../../theme/index.js";
import { Popover } from "../../../../mui/index.js";

export interface ContextMenuProps {
  top?: number;
  left?: number;
  right?: number;
  bottom?: number;
  onClick?: () => void;
}

const CONTEXT_MENU_PREFIX = "context-menu";

export const classes = {
  popover: `${CONTEXT_MENU_PREFIX}-popover`,
};

const StyledContextMenuPopover = styled(Popover)(() => ({
  [`&.${classes.popover}`]: {
    zIndex: 10,
  },
}));

export const ContextMenu: React.FC<
  React.PropsWithChildren<ContextMenuProps>
> = ({ top, left, right, bottom, children, ...props }) => {
  return (
    <StyledContextMenuPopover
      open={true}
      style={{ top, left, right, bottom }}
      className={classes.popover}
      {...props}
    >
      {children}
    </StyledContextMenuPopover>
  );
};
