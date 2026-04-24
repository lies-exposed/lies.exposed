import { useVirtualizer } from "@tanstack/react-virtual";
import * as React from "react";
import { useMuiMediaQuery } from "../../../components/mui/index.js";
import { useTheme } from "../../../theme/index.js";
import { type InfiniteListBaseProps } from "./types.js";

export interface CellRendererProps {
  item: unknown;
  index: number;
  style: React.CSSProperties;
  isLast: boolean;
  measure: () => void;
  onRowInvalidate?: () => void;
  columnWidth: number;
}

type CellRenderer = React.ForwardRefExoticComponent<CellRendererProps>;

export interface InfiniteMasonryProps extends InfiniteListBaseProps {
  CellRenderer: CellRenderer;
  columnCount?: number;
  onMasonryRef?: (_r: unknown, _cellCache: unknown) => void;
  onCellsRendered?: (range: { startIndex: number; stopIndex: number }) => void;
}

const InfiniteMasonryForwardRef: React.ForwardRefRenderFunction<
  unknown,
  React.PropsWithoutRef<InfiniteMasonryProps>
> = (
  {
    columnCount: defaultColumnCount,
    items,
    getItem,
    width,
    height,
    CellRenderer,
    onMasonryRef,
    onCellsRendered,
  },
  ref,
) => {
  const theme = useTheme();
  const isDownMD = useMuiMediaQuery(theme.breakpoints.down("md"));
  const isDownSM = useMuiMediaQuery(theme.breakpoints.down("sm"));

  const columnCount = (defaultColumnCount ?? isDownMD) ? (isDownSM ? 1 : 3) : 4;
  const gap = 8;
  const scrollRef = React.useRef<HTMLDivElement | null>(null);
  const columnWidth = Math.max(
    1,
    (width - gap * (columnCount - 1)) / columnCount,
  );

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => 300,
    overscan: 8,
    gap,
    lanes: columnCount,
    laneAssignmentMode: "measured",
    getItemKey: (index: number) => String(getItem(items, index)?.id ?? index),
  });

  const triggerMeasure = React.useCallback(() => {
    virtualizer.measure();
  }, [virtualizer]);

  React.useImperativeHandle(
    ref,
    () => ({
      scrollToIndex: (index: number) => {
        virtualizer.scrollToIndex(index);
      },
      recomputeCellPositions: () => {
        triggerMeasure();
      },
      clearCellPositions: () => {
        triggerMeasure();
      },
      forceUpdate: () => {
        triggerMeasure();
      },
    }),
    [triggerMeasure, virtualizer],
  );

  React.useEffect(() => {
    onMasonryRef?.(virtualizer, null);
  }, [onMasonryRef, virtualizer]);

  const virtualItems = virtualizer.getVirtualItems();

  React.useEffect(() => {
    if (virtualItems.length === 0) {
      return;
    }

    onCellsRendered?.({
      startIndex: virtualItems[0]?.index ?? 0,
      stopIndex: virtualItems[virtualItems.length - 1]?.index ?? 0,
    });
  }, [onCellsRendered, virtualItems]);

  return (
    <div
      ref={scrollRef}
      style={{
        width,
        height,
        overflow: "auto",
      }}
    >
      <div
        style={{
          width,
          height: virtualizer.getTotalSize(),
          position: "relative",
        }}
      >
        {virtualItems.map((virtualItem: (typeof virtualItems)[number]) => {
          const item =
            getItem(items, virtualItem.index) ?? items[virtualItem.index];
          const isLast = virtualItem.index === items.length - 1;
          const left = virtualItem.lane * (columnWidth + gap);

          return (
            <div
              key={String(virtualItem.key)}
              ref={(node) => {
                if (node) {
                  virtualizer.measureElement(node);
                }
              }}
              style={{
                position: "absolute",
                top: 0,
                left,
                width: columnWidth,
                transform: `translateY(${virtualItem.start}px)`,
              }}
            >
              <CellRenderer
                item={item}
                index={virtualItem.index}
                isLast={isLast}
                style={{ width: columnWidth, height: virtualItem.size }}
                columnWidth={columnWidth}
                measure={triggerMeasure}
                onRowInvalidate={triggerMeasure}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

const InfiniteMasonry = React.forwardRef<unknown, InfiniteMasonryProps>(
  InfiniteMasonryForwardRef,
);

export { InfiniteMasonry };
