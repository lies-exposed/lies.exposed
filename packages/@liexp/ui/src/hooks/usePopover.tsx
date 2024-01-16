import * as React from "react";
import { Popover, type PopoverProps } from "../components/Common/Popover.js";

export const usePopover = (
  props: Partial<Omit<PopoverProps, "open">>,
): [
  React.ReactElement | null,
  (
    title: string,
    el: HTMLElement,
    getContent: (onClose: () => void) => JSX.Element,
  ) => void,
] => {
  const [popoverState, setPopoverState] = React.useState<{
    el: HTMLElement | null;
    title?: string;
    open: boolean;
    content: React.ReactElement | null;
  }>({
    el: null,
    title: undefined,
    open: false,
    content: null,
  });

  const onClose = React.useCallback((): void => {
    setPopoverState((m) => ({ ...m, open: false }));
  }, []);

  const popover = React.useMemo(() => {
    const { title, content, open } = popoverState;
    if (!open || content === null) {
      return null;
    }

    return (
      <Popover
        disablePortal={true}
        {...props}
        anchorEl={popoverState.el}
        open={open}
        onClose={onClose}
        title={title}
      >
        {content}
      </Popover>
    );
  }, [popoverState, onClose]);

  const showPopover = (
    title: string,
    el: HTMLElement,
    getContent: (onClose: () => void) => JSX.Element,
  ): void => {
    setPopoverState({
      el,
      title,
      open: true,
      content: getContent(onClose),
    });
  };
  return [popover, showPopover];
};
