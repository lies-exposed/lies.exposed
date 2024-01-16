// eslint-disable-next-line no-restricted-imports
import MUIPopover, {
  type PopoverProps as MUIPopoverProps,
} from "@mui/material/Popover/index.js";
import * as React from "react";

import { styled } from "../../theme/index.js";

const PREFIX = "popover";

const classes = {
  root: `${PREFIX}-root`,
  paper: `${PREFIX}-paper`,
};

const StyledPopover = styled(MUIPopover)(({ theme }) => ({
  [`&.${classes.root}`]: {
    position: "fixed",
    zIndex: 9999,
    [`> .${classes.paper}`]: {
      minWidth: 300,
      minHeight: 200,
      width: 300,
      height: 200,
      // display: "flex",
      // flexDirection: "column",
      // height: "100%",
      // margin: theme.spacing(2),
      // padding: theme.spacing(2),
      // backgroundColor: theme.palette.common.white,
    },
  },
}));

export interface PopoverProps extends MUIPopoverProps {
  title?: string;
  open: boolean;
}

export const Popover: React.FC<PopoverProps> = ({ children, ...props }) => {
  return (
    <StyledPopover
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "left",
      }}
      // transformOrigin={{
      //   vertical: "top",
      //   horizontal: "left",
      // }}
      classes={classes}
      {...props}
    >
      {children ?? null}
    </StyledPopover>
  );
};
