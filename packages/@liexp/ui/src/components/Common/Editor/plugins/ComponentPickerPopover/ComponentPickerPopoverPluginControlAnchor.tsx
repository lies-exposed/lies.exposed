import React from "react";
import { ANCHOR_ID } from "./constants/anchor.constant.js";

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

export const useAnchorClick = (click?: boolean): [boolean] => {
  const [, found, anchorNode] = useAnchorListener();

  React.useEffect(() => {
    if (anchorNode && click) {
      anchorNode.click();
    }
  }, [found]);
  return [found];
};

export const ComponentPickerPopoverControlAnchorWrapper: React.FC<{
  active: boolean;
  children: (anchorNode: HTMLElement, props: any) => React.ReactNode;
}> = ({ children, active, ...props }) => {
  const [, anchorFound, anchorNode] = useAnchorListener();
  const childs = React.useMemo(() => {
    if (!active || !anchorFound) {
      return null;
    }

    return <span>{anchorNode ? children(anchorNode, props) : null}</span>;
  }, [active, anchorFound, anchorNode]);

  return childs;
};

export const ComponentPickerPopoverRendererAnchorWrapper: React.FC<
  React.PropsWithChildren<{
    name: string;
    isSelected: boolean;
    readOnly: boolean;
    hasData: boolean;
  }>
> = ({ name, isSelected, readOnly = true, hasData, children }) => {
  const ref = React.createRef<HTMLElement>();

  useAnchorClick(isSelected && !readOnly);

  const anchorEl = React.useMemo(() => {
    if (!readOnly && isSelected) {
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
