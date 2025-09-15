import * as React from "react";
import {
  CellMeasurer,
  CellMeasurerCache,
  Masonry,
  createMasonryCellPositioner,
  type MasonryCellProps,
  type MasonryProps,
} from "react-virtualized";
import { throttle } from "throttle-debounce";
import { useMuiMediaQuery } from "../../../components/mui/index.js";
import useWindowDimensions from "../../../hooks/useWindowsDimensions.js";
import { styled, useTheme } from "../../../theme/index.js";
import { type InfiniteListBaseProps } from "./types.js";

export interface CellRendererProps
  extends Omit<MasonryCellProps, "key" | "parent"> {
  item: any;
  isLast: boolean;
  measure: () => void;
  onRowInvalidate?: () => void;
  columnWidth: number;
}

type CellRenderer = React.ForwardRefExoticComponent<CellRendererProps>;

export type InfiniteMasonryCellProps<P> = MasonryCellProps &
  Omit<P, "onLoad" | "onRowInvalidate"> &
  Omit<CellRendererProps, "measure"> & {
    CellRenderer: CellRenderer;
    k: string;
  };

const Cell: React.FC<InfiniteMasonryCellProps<unknown>> = (props) => {
  const {
    isLast,
    style,
    parent,
    index,
    k: key,
    CellRenderer,
    item,
    onRowInvalidate,
    ...rest
  } = props;

  return (
    <CellMeasurer key={key} cache={cellCache} index={index} parent={parent}>
      {({ registerChild, measure }) => {
        const cellRendererProps = {
          ref: registerChild as React.Ref<any>,
          isLast,
          style,
          index,
          item,
          measure,
          onRowInvalidate: () => {
            cellCache.clear(index, 0);
            onRowInvalidate?.();
            setTimeout(() => {
              measure();
            }, 300);
          },
          ...rest,
        };

        // console.log(rowRendererProps);

        return <CellRenderer {...cellRendererProps} />;
      }}
    </CellMeasurer>
  );
};

const PREFIX = "InfiniteList";
const classes = {
  root: `${PREFIX}-timeline`,
  listSubheader: `${PREFIX}-listSubheader`,
  listItemUList: `${PREFIX}-listItemUList`,
};

const StyledMasonry = styled(Masonry)(({ theme }) => ({
  [`&.${classes.root}`]: {
    // padding: 0,
    // paddingTop: 20,
    // width: "100%",
  },

  [`& .${classes.listSubheader}`]: {},

  [`& .${classes.listItemUList}`]: {},
}));

const cellCache = new CellMeasurerCache({
  fixedWidth: false,
  fixedHeight: false,
});

type InfiniteMasonryProps = MasonryProps &
  InfiniteListBaseProps & {
    CellRenderer: CellRenderer;
    columnCount?: number;
    onMasonryRef?: (r: Masonry | null, cellCache: CellMeasurerCache) => void;
  };

let masonryRef: Masonry | null = null;
const InfiniteMasonryForwardRef: React.ForwardRefRenderFunction<
  Masonry,
  React.PropsWithoutRef<InfiniteMasonryProps>
> = (
  {
    columnCount: defaultColumnCount,
    items,
    getItem,
    cellRenderer,
    width,
    CellRenderer,
    onMasonryRef,
    autoHeight,
    height,
    ...props
  },
  ref,
) => {
  const theme = useTheme();
  const isDownMD = useMuiMediaQuery(theme.breakpoints.down("md"));
  const isDownSM = useMuiMediaQuery(theme.breakpoints.down("sm"));

  const columnCount = (defaultColumnCount ?? isDownMD) ? (isDownSM ? 1 : 3) : 4;

  const { columnWidth, positionerCache } = React.useMemo(() => {
    const columnWidth = width / columnCount;
    return {
      columnWidth,
      positionerCache: createMasonryCellPositioner({
        cellMeasurerCache: cellCache,
        columnCount,
        columnWidth,
        spacer: 2,
      }),
    };
  }, [width, columnCount]);

  useWindowDimensions({
    onResize: throttle(300, () => {
      // setTimeout(() => {
      const newColumnCount = isDownMD ? (isDownSM ? 1 : 3) : 4;
      if (newColumnCount !== columnCount) {
        positionerCache.reset({
          columnCount: newColumnCount,
          columnWidth: width / newColumnCount,
        });
      }
      masonryRef?.recomputeCellPositions();
      // }, 300);
    }),
  });

  React.useEffect(() => {
    onMasonryRef?.(masonryRef, cellCache);
  }, []);

  return (
    <StyledMasonry
      ref={(r) => {
        masonryRef = r;
        // r = ref as any;
      }}
      {...props}
      width={width}
      height={height}
      autoHeight={autoHeight}
      cellCount={items.length}
      cellMeasurerCache={cellCache}
      cellPositioner={positionerCache}
      overscanByPixels={400}
      onCellsRendered={({ startIndex, stopIndex }) => {
        props.onCellsRendered?.({ startIndex, stopIndex });
      }}
      cellRenderer={({ key, index, ...rest }) => {
        const item = getItem(items, index);
        const isLast = items.length === index + 1;
        return (
          <Cell
            {...rest}
            index={index}
            key={item.id}
            k={item.id}
            item={item}
            isLast={isLast}
            CellRenderer={CellRenderer}
            columnWidth={columnWidth}
            onRowInvalidate={() => {
              cellCache.clear(index, 0);
            }}
          />
        );
      }}
    />
  );
};

const InfiniteMasonry = React.forwardRef<Masonry, InfiniteMasonryProps>(
  InfiniteMasonryForwardRef,
);

export { InfiniteMasonry, type InfiniteMasonryProps };
