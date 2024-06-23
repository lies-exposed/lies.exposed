import * as React from "react";
import {
  CellMeasurer,
  CellMeasurerCache,
  List,
  type ListRowProps,
} from "react-virtualized";
import { styled } from "../../../theme/index.js";
import { type InfiniteListBaseProps } from "./types.js";

export interface RowRendererProps extends Omit<ListRowProps, "parent"> {
  item: any;
  isLast: boolean;
  measure: () => void;
  onRowInvalidate?: () => void;
}

type RowRenderer = React.ForwardRefExoticComponent<RowRendererProps>;

type InfiniteListRowProps<P> = ListRowProps &
  Omit<P, "onLoad" | "onRowInvalidate"> &
  Omit<RowRendererProps, "measure"> & {
    RowRenderer: RowRenderer;
    k: string;
  };

const Row: React.FC<InfiniteListRowProps<unknown>> = (props) => {
  const {
    isVisible,
    isLast,
    style,
    parent,
    index,
    k: key,
    RowRenderer,
    item,
    onRowInvalidate,
    ...rest
  } = props;

  return (
    <CellMeasurer
      key={key}
      cache={cellCache}
      columnIndex={0}
      rowIndex={index}
      parent={parent}
    >
      {({ registerChild, measure }) => {
        if (!item) {
          return (
            <div
              ref={registerChild as React.Ref<any>}
              key={key}
              style={{ height: 300 }}
            />
          );
        }

        if (!isVisible) {
          // console.log("no visible", index);
          return (
            <div
              key={key}
              ref={registerChild as React.Ref<any>}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: 300,
                width: "100%",
                ...props.style,
              }}
            />
          );
        }

        const rowRendererProps = {
          ref: registerChild as React.Ref<any>,
          isVisible,
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

        return <RowRenderer {...rowRendererProps} />;
      }}
    </CellMeasurer>
  );
};

const PREFIX = "InfiniteList";
const classes = {
  timeline: `${PREFIX}-timeline`,
  listSubheader: `${PREFIX}-listSubheader`,
  listItemUList: `${PREFIX}-listItemUList`,
};

const StyledList = styled(List)(({ theme }) => ({
  [`&.${classes.timeline}`]: {
    padding: 0,
    paddingTop: 20,
    width: "100%",
  },

  [`& .${classes.listSubheader}`]: {
    backgroundColor: theme.palette.common.white,
  },

  [`& .${classes.listItemUList}`]: {
    padding: 0,
    width: "100%",
  },
}));

export interface InfiniteListProps extends InfiniteListBaseProps {
  onRowsRendered: (params: { startIndex: number; stopIndex: number }) => void;
  RowRenderer: RowRenderer;
}

const cellCache = new CellMeasurerCache({
  fixedWidth: true,
  minWidth: 200,
  fixedHeight: true,
  defaultHeight: 300,
});

const InfiniteListForwardRef: React.ForwardRefRenderFunction<
  unknown,
  InfiniteListProps
> = ({ width, height, onRowsRendered, items, getItem, ...rest }, listRef) => {
  // console.log("items", items.length);
  return (
    <StyledList
      ref={listRef}
      width={width}
      height={height}
      estimatedRowSize={300}
      overscanRowCount={10}
      onRowsRendered={onRowsRendered}
      rowRenderer={({ key, ...props }) => {
        const item = getItem(items, props.index);
        const isLast = items.length === props.index + 1;
        // console.log({ item: item.id, isLast, isVisible: props.isVisible });
        return (
          <Row
            {...rest}
            {...props}
            k={key}
            key={key}
            item={item}
            isLast={isLast}
          />
        );
      }}
      rowCount={items.length}
      rowHeight={cellCache.rowHeight}
      deferredMeasurementCache={cellCache}
    />
  );
};

export const InfiniteList = React.forwardRef(InfiniteListForwardRef);
