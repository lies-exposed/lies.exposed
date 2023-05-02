import * as React from "react";
import { Popover, type PopoverProps } from "../components/mui";
import { styled } from "../theme";

const PREFIX = "popover";

const classes = {
  root: `${PREFIX}-root`,
  paper: `${PREFIX}-paper`,
};

const StyledPopover = styled(Popover)(({ theme }) => ({
  [`&.${classes.root}`]: {
    minWidth: 100,
    minHeight: 60,
  },
  [`& .${classes.paper}`]: {
    // display: "flex",
    // flexDirection: "column",
    // height: "100%",
    // margin: theme.spacing(2),
    // padding: theme.spacing(2),
    // backgroundColor: theme.palette.common.white,
  },
}));

export const usePopover = (
  props: Omit<PopoverProps, "open">
): [
  React.ReactElement | null,
  (title: string, getContent: (onClose: () => void) => JSX.Element) => void
] => {
  const [popoverState, setPopoverState] = React.useState<{
    title?: string;
    open: boolean;
    content: React.ReactElement | null;
  }>({
    title: undefined,
    open: false,
    content: null,
  });

  const onClose = React.useCallback((): void => {
    setPopoverState((m) => ({ ...m, open: false }));
  }, []);

  const modal = React.useMemo(() => {
    const { title, content, open } = popoverState;
    if (!open || content === null) {
      return null;
    }

    return (
      <StyledPopover
        {...props}
        className={classes.root}
        open={open}
        onClose={onClose}
        title={title}
        disablePortal={true}
      >
        {content}
      </StyledPopover>
    );
  }, [popoverState, onClose]);

  const showPopover = (
    title: string,
    getContent: (onClose: () => void) => JSX.Element
  ): void => {
    setPopoverState({
      title,
      open: true,
      content: getContent(onClose),
    });
  };
  return [modal, showPopover];
};
