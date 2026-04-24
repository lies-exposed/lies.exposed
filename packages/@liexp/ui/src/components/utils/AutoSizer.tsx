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

  const updateSize = React.useCallback(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const nextWidth = disableWidth ? size.width : container.clientWidth;
    const nextHeight = disableHeight ? size.height : container.clientHeight;

    setSize((current) => {
      if (current.width === nextWidth && current.height === nextHeight) {
        return current;
      }
      return { width: nextWidth, height: nextHeight };
    });
  }, [disableWidth, disableHeight, size.width, size.height]);

  React.useLayoutEffect(() => {
    updateSize();

    const container = containerRef.current;
    if (!container) {
      return undefined;
    }

    const resizeObserver = new ResizeObserver(() => {
      updateSize();
    });

    resizeObserver.observe(container);

    return () => {
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
