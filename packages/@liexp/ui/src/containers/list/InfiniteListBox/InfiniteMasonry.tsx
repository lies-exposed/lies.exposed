import * as React from "react";
import { useMuiMediaQuery } from "../../../components/mui/index.js";
import { useMasonryLayout } from "../../../hooks/useMasonryLayout.js";
import { useWindowVirtualization } from "../../../hooks/useWindowVirtualization.js";
import { useTheme } from "../../../theme/index.js";
import {
  type InfiniteListBaseProps,
  type CellRendererProps,
  type MasonryImperativeHandle,
} from "./types.js";

// Re-export for external use
export { type CellRendererProps };

type CellRenderer = React.ForwardRefExoticComponent<CellRendererProps>;

export interface InfiniteMasonryProps extends InfiniteListBaseProps {
  CellRenderer: CellRenderer;
  columnCount?: number;
  onMasonryRef?: (_r: unknown, _cellCache: unknown) => void;
  onCellsRendered?: (range: { startIndex: number; stopIndex: number }) => void;
  /**
   * Layout mode for masonry positioning:
   * - 'stable': Cards maintain their column assignments, only move vertically (better UX for expand/collapse)
   * - 'optimal': Cards can move between columns for optimal space usage
   */
  layoutMode?: "stable" | "optimal";
}

const InfiniteMasonryForwardRef: React.ForwardRefRenderFunction<
  MasonryImperativeHandle,
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
    layoutMode = "stable", // Default to stable layout for better UX
  },
  ref,
) => {
  const theme = useTheme();
  const isDownMD = useMuiMediaQuery(theme.breakpoints.down("md"));
  const isDownSM = useMuiMediaQuery(theme.breakpoints.down("sm"));

  const columnCount = defaultColumnCount ?? (isDownMD ? (isDownSM ? 1 : 3) : 4);
  const gap = 8;
  const scrollRef = React.useRef<HTMLDivElement | null>(null);
  const [scrollTop, setScrollTop] = React.useState(0);

  const columnWidth = Math.max(
    1,
    (width - gap * (columnCount - 1)) / columnCount,
  );

  // Use custom masonry layout hook
  const masonryLayout = useMasonryLayout({
    items,
    columnCount,
    columnWidth,
    gap,
    defaultItemHeight: 300,
    useStableLayout: layoutMode === "stable",
  });

  // Use window-based virtualization for masonry
  const virtualItems = useWindowVirtualization({
    items,
    masonryLayout,
    containerHeight: height,
    scrollTop,
    overscan: 300,
  });

  // Handle scroll events with throttling to prevent excessive updates
  const scrollTimeoutRef = React.useRef<number | null>(null);

  const handleScroll = React.useCallback(
    (event: React.UIEvent<HTMLDivElement>) => {
      const newScrollTop = event.currentTarget.scrollTop;

      // Throttle scroll updates to improve performance
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      scrollTimeoutRef.current = window.setTimeout(() => {
        setScrollTop(newScrollTop);
      }, 16); // ~60fps
    },
    [],
  );

  // Cleanup scroll timeout
  React.useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  // Track element refs for resize observation
  const elementRefs = React.useRef<Map<number, Element>>(new Map());

  // Measure element callback - prevent infinite loops but track elements
  const measureElement = React.useCallback(
    (element: Element | null, index: number) => {
      if (element) {
        const rect = element.getBoundingClientRect();
        const currentHeight = masonryLayout.itemPositions.get(index)?.height;

        // Only update if height has actually changed significantly
        if (!currentHeight || Math.abs(rect.height - currentHeight) > 1) {
          masonryLayout.updateItemHeight(index, rect.height);
        }

        // Store element reference for resize observation
        elementRefs.current.set(index, element);
      } else {
        // Clean up reference when element is removed
        elementRefs.current.delete(index);
      }
    },
    [masonryLayout.updateItemHeight, masonryLayout.itemPositions],
  );

  // Set up ResizeObserver for automatic resize detection of currently visible items
  React.useEffect(() => {
    const resizeObserver = new ResizeObserver((entries) => {
      entries.forEach((entry) => {
        const element = entry.target;
        const indexAttr = element.getAttribute("data-index");
        if (indexAttr) {
          const index = parseInt(indexAttr, 10);
          const newHeight = entry.contentRect.height;
          const currentHeight = masonryLayout.itemPositions.get(index)?.height;

          // Update layout when size changes significantly (like expand/collapse)
          if (!currentHeight || Math.abs(newHeight - currentHeight) > 2) {
            masonryLayout.updateItemHeight(index, newHeight);
          }
        }
      });
    });

    // Observe elements that are currently rendered
    virtualItems.forEach(({ index }) => {
      const element = elementRefs.current.get(index);
      if (element) {
        resizeObserver.observe(element);
      }
    });

    return () => {
      resizeObserver.disconnect();
    };
  }, [virtualItems, masonryLayout.updateItemHeight]);

  // Measure callback for CellRenderer - triggers explicit re-measurement
  const triggerMeasure = React.useCallback(() => {
    // Force remeasurement of all visible items
    // This is safe because it's triggered by user actions (expand/collapse)
    elementRefs.current.forEach((element, index) => {
      const rect = element.getBoundingClientRect();
      masonryLayout.updateItemHeight(index, rect.height);
    });
  }, [masonryLayout.updateItemHeight]);

  // Imperative handle for external control
  React.useImperativeHandle(
    ref,
    () => ({
      scrollToIndex: (index: number) => {
        const position = masonryLayout.itemPositions.get(index);
        if (position && scrollRef.current) {
          scrollRef.current.scrollTo({
            top: position.y,
            behavior: "smooth",
          });
        }
      },
      recomputeCellPositions: () => {
        masonryLayout.resetLayout();
      },
      clearCellPositions: () => {
        masonryLayout.resetLayout();
      },
      forceUpdate: () => {
        masonryLayout.resetLayout();
      },
    }),
    [masonryLayout],
  );

  // Notify parent of rendered cell range
  React.useEffect(() => {
    if (virtualItems.length === 0) return;

    const indices = virtualItems
      .map((item) => item.index)
      .sort((a, b) => a - b);
    onCellsRendered?.({
      startIndex: indices[0] ?? 0,
      stopIndex: indices[indices.length - 1] ?? 0,
    });
  }, [virtualItems, onCellsRendered]);

  // Notify parent of masonry ref
  React.useEffect(() => {
    onMasonryRef?.(ref, null);
  }, [onMasonryRef, ref]);

  return (
    <div
      ref={scrollRef}
      onScroll={handleScroll}
      style={{
        width,
        height,
        overflowY: "auto",
        overflowX: "hidden",
      }}
    >
      <div
        style={{
          width,
          height: masonryLayout.totalHeight,
          position: "relative",
        }}
      >
        {virtualItems.map(({ item, index, key }) => {
          const actualItem = getItem(items, index) ?? item;
          const isLast = index === items.length - 1;
          const position = masonryLayout.itemPositions.get(index);

          if (!position) return null;

          return (
            <div
              key={key}
              data-index={index}
              ref={(el) => measureElement(el, index)}
              style={{
                position: "absolute",
                top: position.y,
                left: position.x,
                width: columnWidth,
              }}
            >
              <CellRenderer
                item={actualItem}
                index={index}
                isLast={isLast}
                style={{ width: columnWidth }}
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

const InfiniteMasonry = React.forwardRef<
  MasonryImperativeHandle,
  InfiniteMasonryProps
>(InfiniteMasonryForwardRef);

export { InfiniteMasonry };
