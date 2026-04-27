export interface MasonryPosition {
  x: number;
  y: number;
  height: number;
  column: number; // Track which column the item belongs to
}

export interface MasonryLayoutResult {
  itemPositions: Map<number, MasonryPosition>;
  totalHeight: number;
}

export interface MasonryConfig {
  columnCount: number;
  columnWidth: number;
  gap: number;
}

/**
 * Calculate stable masonry layout positions for items
 * Uses round-robin assignment to maintain consistent column positions
 * Cards stay in their assigned columns and only move vertically
 */
export const calculateMasonryLayout = (
  itemCount: number,
  itemHeights: Map<number, number>,
  config: MasonryConfig,
  defaultHeight = 300,
): MasonryLayoutResult => {
  const { columnCount, columnWidth, gap } = config;
  const columnHeights = new Array(columnCount).fill(0);
  const itemPositions = new Map<number, MasonryPosition>();

  for (let index = 0; index < itemCount; index++) {
    const height = itemHeights.get(index) ?? defaultHeight;

    // Use round-robin assignment to maintain consistent column positions
    // This prevents cards from jumping between columns when others expand/collapse
    const column = index % columnCount;

    // Calculate position in the assigned column
    const x = column * (columnWidth + gap);
    const y = columnHeights[column];

    itemPositions.set(index, { x, y, height, column });

    // Update column height
    columnHeights[column] += height + gap;
  }

  const totalHeight = Math.max(...columnHeights);

  return { itemPositions, totalHeight };
};

/**
 * Alternative: Calculate masonry layout with stable positioning for existing items
 * Only newly added items use shortest column assignment
 */
export const calculateStableMasonryLayout = (
  itemCount: number,
  itemHeights: Map<number, number>,
  config: MasonryConfig,
  existingPositions: Map<number, MasonryPosition> = new Map(),
  defaultHeight = 300,
): MasonryLayoutResult => {
  const { columnCount, columnWidth, gap } = config;
  const columnHeights = new Array(columnCount).fill(0);
  const itemPositions = new Map<number, MasonryPosition>();

  // First pass: Process existing items to maintain their column assignments
  for (let index = 0; index < itemCount; index++) {
    const height = itemHeights.get(index) ?? defaultHeight;
    const existingPosition = existingPositions.get(index);

    if (existingPosition) {
      // Keep existing items in their assigned columns
      const column = existingPosition.column;
      const x = column * (columnWidth + gap);
      const y = columnHeights[column];

      itemPositions.set(index, { x, y, height, column });
      columnHeights[column] += height + gap;
    }
  }

  // Second pass: Assign new items to shortest columns
  for (let index = 0; index < itemCount; index++) {
    if (itemPositions.has(index)) continue; // Skip already positioned items

    const height = itemHeights.get(index) ?? defaultHeight;

    // Find shortest column for new items
    const shortestColumnIndex = columnHeights.indexOf(
      Math.min(...columnHeights),
    );
    const x = shortestColumnIndex * (columnWidth + gap);
    const y = columnHeights[shortestColumnIndex];

    itemPositions.set(index, { x, y, height, column: shortestColumnIndex });
    columnHeights[shortestColumnIndex] += height + gap;
  }

  const totalHeight = Math.max(...columnHeights);

  return { itemPositions, totalHeight };
};

/**
 * Filter items that should be visible in the viewport
 */
export const getVisibleMasonryItems = <T>(
  items: T[],
  itemPositions: Map<number, MasonryPosition>,
  scrollTop: number,
  viewportHeight: number,
  overscan = 100,
): { item: T; index: number; position: MasonryPosition }[] => {
  const scrollBottom = scrollTop + viewportHeight;
  const visibleItems: { item: T; index: number; position: MasonryPosition }[] =
    [];

  items.forEach((item, index) => {
    const position = itemPositions.get(index);
    if (!position) return;

    const itemTop = position.y;
    const itemBottom = position.y + position.height;

    // Include overscan buffer for smoother scrolling
    if (
      itemBottom > scrollTop - overscan &&
      itemTop < scrollBottom + overscan
    ) {
      visibleItems.push({ item, index, position });
    }
  });

  return visibleItems;
};

/**
 * Calculate responsive column count based on container width
 */
export const calculateResponsiveColumns = (
  width: number,
  minColumnWidth = 250,
  maxColumns = 6,
): number => {
  const columns = Math.floor(width / minColumnWidth);
  return Math.min(Math.max(1, columns), maxColumns);
};
