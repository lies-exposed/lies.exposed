import * as React from "react";
import { Popover, type PopoverProps } from "../components/Common/Popover";

export const usePopover = (
  props: Partial<Omit<PopoverProps, "open">>
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

  const popover = React.useMemo(() => {
    const { title, content, open } = popoverState;
    if (!open || content === null) {
      return null;
    }

    return (
      <Popover
        disablePortal={true}
        {...props}
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
    getContent: (onClose: () => void) => JSX.Element
  ): void => {
    setPopoverState({
      title,
      open: true,
      content: getContent(onClose),
    });
  };
  return [popover, showPopover];
};
