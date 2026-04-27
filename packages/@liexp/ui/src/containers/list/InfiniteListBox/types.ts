export interface InfiniteListBaseProps {
  width: number;
  height: number;
  items: any[];
  getItem: (data: any[], index: number) => any;
}

export interface CellRendererProps {
  item: unknown;
  index: number;
  style: React.CSSProperties;
  isLast: boolean;
  measure: () => void;
  onRowInvalidate?: () => void;
  columnWidth: number;
}

export interface MasonryImperativeHandle {
  scrollToIndex: (index: number) => void;
  recomputeCellPositions: () => void;
  clearCellPositions: () => void;
  forceUpdate: () => void;
}
