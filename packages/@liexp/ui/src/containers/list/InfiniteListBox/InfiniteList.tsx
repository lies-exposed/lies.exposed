import { useVirtualizer } from "@tanstack/react-virtual";
import * as React from "react";
import { styled } from "../../../theme/index.js";
import { type InfiniteListBaseProps } from "./types.js";

export interface RowRendererProps extends Record<string, unknown> {
  index: number;
  item: any;
  isLast: boolean;
  isVisible: boolean;
  style: React.CSSProperties;
  measure: () => void;
  onRowInvalidate?: () => void;
}

type RowRenderer = React.ForwardRefExoticComponent<RowRendererProps>;

const PREFIX = "InfiniteList";
const classes = {
  timeline: `${PREFIX}-timeline`,
};

const StyledList = styled("div")(() => ({
  [`&.${classes.timeline}`]: {
    width: "100%",
    height: "100%",
    overflow: "auto",
    paddingTop: 20,
  },
}));

export interface InfiniteListProps extends InfiniteListBaseProps {
  onRowsRendered: (params: { startIndex: number; stopIndex: number }) => void;
  RowRenderer: RowRenderer;
}

const InfiniteListForwardRef: React.ForwardRefRenderFunction<
  unknown,
  InfiniteListProps
> = (
  { height, onRowsRendered, items, getItem, RowRenderer, ...rest },
  listRef,
) => {
  const scrollRef = React.useRef<HTMLDivElement | null>(null);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => 300,
    overscan: 10,
  });

  React.useImperativeHandle(
    listRef,
    () => ({
      scrollToIndex: (index: number) => {
        virtualizer.scrollToIndex(index);
      },
    }),
    [virtualizer],
  );

  const virtualItems = virtualizer.getVirtualItems();

  React.useEffect(() => {
    if (virtualItems.length === 0) {
      return;
    }

    const start = virtualItems[0]?.index ?? 0;
    const stop = virtualItems[virtualItems.length - 1]?.index ?? 0;
    onRowsRendered({ startIndex: start, stopIndex: stop });
  }, [onRowsRendered, virtualItems]);

  return (
    <StyledList ref={scrollRef} className={classes.timeline} style={{ height }}>
      <div
        style={{
          position: "relative",
          width: "100%",
          height: virtualizer.getTotalSize(),
        }}
      >
        {virtualItems.map((virtualItem) => {
          const item = getItem(items, virtualItem.index);
          const isLast = items.length === virtualItem.index + 1;

          const commonStyle: React.CSSProperties = {
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            transform: `translateY(${virtualItem.start}px)`,
          };

          if (!item) {
            return (
              <div
                key={`empty-${virtualItem.index}`}
                ref={(node) => {
                  if (node) {
                    virtualizer.measureElement(node);
                  }
                }}
                style={{ ...commonStyle, minHeight: 300 }}
              />
            );
          }

          return (
            <div
              key={String(item.id ?? virtualItem.index)}
              ref={(node) => {
                if (node) {
                  virtualizer.measureElement(node);
                }
              }}
              style={commonStyle}
            >
              <RowRenderer
                {...rest}
                index={virtualItem.index}
                item={item}
                isVisible={true}
                isLast={isLast}
                style={{ width: "100%" }}
                measure={() => {
                  virtualizer.measure();
                }}
                onRowInvalidate={() => {
                  virtualizer.measure();
                }}
              />
            </div>
          );
        })}
      </div>
    </StyledList>
  );
};

export const InfiniteList = React.forwardRef(InfiniteListForwardRef);
