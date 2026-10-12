import * as React from "react";

interface Size {
  width: number;
  height: number;
}

export interface AutoSizerProps {
  children: (size: Size) => React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
  disableWidth?: boolean;
  disableHeight?: boolean;
  defaultWidth?: number;
  defaultHeight?: number;
}

export const AutoSizer: React.FC<AutoSizerProps> = ({
  children,
  style,
  className,
  disableWidth = false,
  disableHeight = false,
  defaultWidth = 0,
  defaultHeight = 0,
}) => {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const [size, setSize] = React.useState<Size>({
    width: defaultWidth,
    height: defaultHeight,
  });

  // `size` must not be a dependency: re-creating `updateSize` on every resize
  // re-runs the layout effect, which re-measures synchronously. When children
  // change the container's size this chains nested updates until React throws
  // "Maximum update depth exceeded" (#185).
  const updateSize = React.useCallback(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    setSize((current) => {
      const nextWidth = disableWidth ? current.width : container.clientWidth;
      const nextHeight = disableHeight
        ? current.height
        : container.clientHeight;
      if (current.width === nextWidth && current.height === nextHeight) {
        return current;
      }
      return { width: nextWidth, height: nextHeight };
    });
  }, [disableWidth, disableHeight]);

  React.useLayoutEffect(() => {
    updateSize();

    const container = containerRef.current;
    if (!container) {
      return undefined;
    }

    // coalesce observer notifications into one update per frame
    let frame: number | null = null;
    const resizeObserver = new ResizeObserver(() => {
      if (frame !== null) {
        return;
      }
      frame = requestAnimationFrame(() => {
        frame = null;
        updateSize();
      });
    });

    resizeObserver.observe(container);

    return () => {
      if (frame !== null) {
        cancelAnimationFrame(frame);
      }
      resizeObserver.disconnect();
    };
  }, [updateSize]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ width: "100%", height: "100%", ...style }}
    >
      {children(size)}
    </div>
  );
};
