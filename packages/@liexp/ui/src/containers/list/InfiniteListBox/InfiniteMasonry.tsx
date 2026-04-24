import { Masonry } from "@mui/lab";
import * as React from "react";
import { useMuiMediaQuery } from "../../../components/mui/index.js";
import { styled, useTheme } from "../../../theme/index.js";
import { type InfiniteListBaseProps } from "./types.js";

export interface CellRendererProps {
  item: any;
  index: number;
  style: React.CSSProperties;
  isLast: boolean;
  measure: () => void;
  onRowInvalidate?: () => void;
  columnWidth: number;
}

type CellRenderer = React.ForwardRefExoticComponent<CellRendererProps>;

const PREFIX = "InfiniteMasonry";
const classes = {
  root: `${PREFIX}-root`,
};

const StyledMasonry = styled(Masonry)(() => ({
  [`&.${classes.root}`]: {
    width: "100%",
  },
}));

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
    CellRenderer,
    onMasonryRef,
    onCellsRendered,
    ...props
  },
  ref,
) => {
  const theme = useTheme();
  const isDownMD = useMuiMediaQuery(theme.breakpoints.down("md"));
  const isDownSM = useMuiMediaQuery(theme.breakpoints.down("sm"));

  const columnCount = (defaultColumnCount ?? isDownMD) ? (isDownSM ? 1 : 3) : 4;
  const columnWidth = width / columnCount;

  React.useEffect(() => {
    onMasonryRef?.(null, null);
  }, [onMasonryRef]);

  React.useEffect(() => {
    if (items.length === 0) {
      return;
    }

    onCellsRendered?.({ startIndex: 0, stopIndex: items.length - 1 });
  }, [items.length, onCellsRendered]);

  return (
    <div
      ref={ref as React.Ref<HTMLDivElement>}
      style={{
        width,
        height: props.height,
        overflow: "auto",
      }}
    >
      <StyledMasonry className={classes.root} columns={columnCount} spacing={1}>
        {items.map((datum, index) => {
          const item = getItem(items, index) ?? datum;
          const isLast = index === items.length - 1;

          return (
            <CellRenderer
              key={String(item?.id ?? index)}
              item={item}
              index={index}
              isLast={isLast}
              style={{ width: columnWidth }}
              columnWidth={columnWidth}
              measure={() => {}}
              onRowInvalidate={() => {}}
            />
          );
        })}
      </StyledMasonry>
    </div>
  );
};

const InfiniteMasonry = React.forwardRef<unknown, InfiniteMasonryProps>(
  InfiniteMasonryForwardRef,
);

export { InfiniteMasonry };
