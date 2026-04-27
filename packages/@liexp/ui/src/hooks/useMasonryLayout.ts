import * as React from "react";
import {
  calculateMasonryLayout,
  calculateStableMasonryLayout,
  type MasonryConfig,
  type MasonryLayoutResult,
  type MasonryPosition,
} from "../components/utils/masonry.js";

export interface UseMasonryLayoutOptions extends MasonryConfig {
  items: unknown[];
  defaultItemHeight?: number;
  useStableLayout?: boolean; // New option for stable positioning
}

export interface UseMasonryLayoutResult extends MasonryLayoutResult {
  updateItemHeight: (index: number, height: number) => void;
  resetLayout: () => void;
}

/**
 * Custom hook for managing masonry layout calculations
 * Handles item height tracking and layout recomputation
 */
export const useMasonryLayout = ({
  items,
  columnCount,
  columnWidth,
  gap,
  defaultItemHeight = 300,
  useStableLayout = true, // Default to stable layout
}: UseMasonryLayoutOptions): UseMasonryLayoutResult => {
  const [itemHeights, setItemHeights] = React.useState<Map<number, number>>(
    new Map(),
  );

  // Keep track of existing positions for stable layout
  const existingPositionsRef = React.useRef<Map<number, MasonryPosition>>(
    new Map(),
  );

  // Debounce height updates to prevent infinite loops
  const pendingUpdatesRef = React.useRef<Map<number, number>>(new Map());
  const updateTimeoutRef = React.useRef<number | null>(null);

  const flushPendingUpdates = React.useCallback(() => {
    if (pendingUpdatesRef.current.size === 0) return;

    setItemHeights((prev) => {
      const next = new Map(prev);
      let hasChanges = false;

      pendingUpdatesRef.current.forEach((height, index) => {
        if (next.get(index) !== height) {
          next.set(index, height);
          hasChanges = true;
        }
      });

      pendingUpdatesRef.current.clear();
      return hasChanges ? next : prev;
    });
  }, []);

  const updateItemHeight = React.useCallback(
    (index: number, height: number) => {
      // Batch updates to prevent excessive re-renders
      pendingUpdatesRef.current.set(index, height);

      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }

      updateTimeoutRef.current = window.setTimeout(flushPendingUpdates, 16); // ~60fps
    },
    [flushPendingUpdates],
  );

  const resetLayout = React.useCallback(() => {
    // Clear pending updates
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
      updateTimeoutRef.current = null;
    }
    pendingUpdatesRef.current.clear();

    // Clear existing positions for fresh layout
    existingPositionsRef.current.clear();
    setItemHeights(new Map());
  }, []);

  // Clean up timeout on unmount
  React.useEffect(() => {
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, []);

  const layoutResult = React.useMemo(() => {
    const config = { columnCount, columnWidth, gap };

    let result: MasonryLayoutResult;

    if (useStableLayout) {
      // Use stable layout that preserves existing column assignments
      result = calculateStableMasonryLayout(
        items.length,
        itemHeights,
        config,
        existingPositionsRef.current,
        defaultItemHeight,
      );
    } else {
      // Use original shortest-column algorithm
      result = calculateMasonryLayout(
        items.length,
        itemHeights,
        config,
        defaultItemHeight,
      );
    }

    // Update existing positions for next calculation
    existingPositionsRef.current = new Map(result.itemPositions);

    return result;
  }, [
    items.length,
    itemHeights,
    columnCount,
    columnWidth,
    gap,
    defaultItemHeight,
    useStableLayout,
  ]);

  return {
    ...layoutResult,
    updateItemHeight,
    resetLayout,
  };
};
