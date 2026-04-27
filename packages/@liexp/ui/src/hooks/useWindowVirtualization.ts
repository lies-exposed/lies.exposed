import * as React from "react";
import { type MasonryLayoutResult } from "../components/utils/masonry.js";

export interface UseWindowVirtualizationOptions {
  items: unknown[];
  masonryLayout: MasonryLayoutResult;
  containerHeight: number;
  scrollTop: number;
  overscan?: number;
}

export interface VirtualItem {
  index: number;
  key: string;
  item: unknown;
}

/**
 * Window-based virtualization for masonry layouts
 * Only renders items that are visible in the current viewport
 */
export const useWindowVirtualization = ({
  items,
  masonryLayout,
  containerHeight,
  scrollTop,
  overscan = 200,
}: UseWindowVirtualizationOptions): VirtualItem[] => {
  return React.useMemo(() => {
    const visibleItems: VirtualItem[] = [];
    const viewportTop = scrollTop - overscan;
    const viewportBottom = scrollTop + containerHeight + overscan;

    // Early return if no positions calculated yet
    if (masonryLayout.itemPositions.size === 0) {
      return [];
    }

    items.forEach((item, index) => {
      const position = masonryLayout.itemPositions.get(index);
      if (!position) return;

      const itemTop = position.y;
      const itemBottom = position.y + position.height;

      // Check if item intersects with the viewport (including overscan)
      if (itemBottom >= viewportTop && itemTop <= viewportBottom) {
        visibleItems.push({
          index,
          key: `masonry-item-${index}`,
          item,
        });
      }
    });

    return visibleItems;
  }, [
    items.length, // Only track length, not items content
    masonryLayout.itemPositions,
    masonryLayout.totalHeight,
    containerHeight,
    scrollTop,
    overscan,
  ]);
};
