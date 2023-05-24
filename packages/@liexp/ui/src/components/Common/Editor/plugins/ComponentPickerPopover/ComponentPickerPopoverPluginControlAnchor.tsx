import React from "react";
import { ANCHOR_ID } from "./constants";

/**
 * Checks whatever a div with id {@link ANCHOR_ID} is present in DOM.
 *
 * @returns [boolean, HTMLElement] - A tuple with 'found' value and the found element
 */
export const useAnchorListener = (): [boolean, boolean, HTMLElement | null] => {
  const [[loading, found], setFound] = React.useState<[boolean, boolean]>([
    true,
    false,
  ]);

  const anchorNode = document.getElementById(ANCHOR_ID);

  React.useEffect(() => {
    const timer = setInterval(() => {
      const anchorNode = document.getElementById(ANCHOR_ID);
      if (!!anchorNode && !found) {
        setFound([false, true]);
      }

      if (found) {
        clearInterval(timer);
      }
    }, 500);

    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [found]);

  return [loading, found, anchorNode];
};

export const useAnchorClick = (): [boolean] => {
  const [, found, anchorNode] = useAnchorListener();
  React.useEffect(() => {
    if (anchorNode) {
      anchorNode.click();
    }
  }, [found]);
  return [found];
};

export const ComponentPickerPopoverControlAnchorWrapper: React.FC<{
  children: (anchorNode: HTMLElement, props: any) => React.ReactNode;
}> = ({ children, ...props }) => {
  const [, anchorFound, anchorNode] = useAnchorListener();

  const childs = React.useMemo(() => {
    if (!anchorFound) {
      return null;
    }

    return <span>{anchorNode ? children(anchorNode, props) : null}</span>;
  }, [anchorFound]);

  return childs;
};

export const ComponentPickerPopoverRendererAnchorWrapper: React.FC<
  React.PropsWithChildren<{
    isSelected: boolean;
    readOnly: boolean;
    hasData: boolean;
  }>
> = ({ isSelected, readOnly, hasData, children }) => {
  const ref = React.createRef<HTMLElement>();

  const anchorEl = React.useMemo(() => {
    if (!hasData || !readOnly || isSelected) {
      return (
        <span
          id={ANCHOR_ID}
          ref={ref}
          style={{
            display: "inline",
          }}
        />
      );
    }
    return null;
  }, [readOnly, hasData, isSelected]);

  return (
    <span style={{ display: "inline" }}>
      {children}
      {anchorEl}
    </span>
  );
};
