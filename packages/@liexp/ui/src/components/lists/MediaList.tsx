import type * as io from "@liexp/shared/io/http";
import { clsx } from "clsx";
import * as React from "react";
import {
  AutoSizer,
  CellMeasurer,
  CellMeasurerCache,
  Masonry,
  type MasonryCellProps,
  type MasonryProps,
  type Size,
} from "react-virtualized";
import { type RenderedRows } from "react-virtualized/dist/commonjs/List";
import {
  createCellPositioner,
  type Positioner,
} from "react-virtualized/dist/commonjs/Masonry";
import { styled } from "../../theme";
import { type ListItemProps } from "../Common/List";
import { defaultImage } from "../SEO";
import { Box, Typography } from "../mui";

export interface Media extends io.Media.Media {
  selected: boolean;
}

const MEDIA_LIST_ITEM_PREFIX = "media-list-item";
const classes = {
  root: `${MEDIA_LIST_ITEM_PREFIX}-root`,
  wrapper: `${MEDIA_LIST_ITEM_PREFIX}-wrapper`,
  media: `${MEDIA_LIST_ITEM_PREFIX}-media`,
  description: `${MEDIA_LIST_ITEM_PREFIX}-description`,
};

const StyledGridItem = styled(Box)({
  [`&.${classes.root}`]: {
    width: "100%",
    maxWidth: 300,
    display: "flex",
    flexDirection: "row",
    "&:hover": {
      [`& .${classes.description}`]: {
        opacity: 1,
      },
    },
  },
  [`& .${classes.wrapper}`]: {
    position: "relative",
    display: "flex",
    flexDirection: "row",
    width: "100%",
    height: "100%",
    maxHeight: 250,
    alignItems: "center",
    overflow: "hidden",
  },
  [`& .${classes.media}`]: {
    maxWidth: "100%",
    height: "100%",
    objectFit: "contain",
  },
  [`& .${classes.description}`]: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    opacity: 0,
    padding: 10,
    backgroundColor: "black",
  },
});

interface MediaListItemProps extends ListItemProps<Media> {
  style?: React.CSSProperties;
  hideDescription?: boolean;
  onLoad?: () => void;
}

export const MediaListItem: React.ForwardRefRenderFunction<
  any,
  MediaListItemProps
> = ({ style, onClick, item, onLoad, hideDescription }, ref) => {
  return (
    <StyledGridItem className={clsx(classes.root)} style={style} ref={ref}>
      <Box
        className={clsx(classes.wrapper)}
        style={{
          cursor: "pointer",
          display: "flex",
          flexDirection: "column",
        }}
        onClick={() => onClick?.(item)}
      >
        <img
          className={classes.media}
          src={item.thumbnail ?? defaultImage}
          title={item.description}
          loading="lazy"
          onLoad={onLoad}
        />

        {!hideDescription ? (
          <Box className={classes.description}>
            <Typography
              gutterBottom
              variant="body2"
              component="p"
              color="white"
            >
              {item.description.substring(0, 100).concat("...")}
            </Typography>
          </Box>
        ) : null}
      </Box>
    </StyledGridItem>
  );
};

export const MediaListItemRef = React.forwardRef(MediaListItem);

export const MediaListItemCell: React.FC<
  MediaListItemProps &
    MasonryCellProps & {
      cache: CellMeasurerCache;
    } & { width: number }
> = ({
  item,
  index,
  isScrolling,
  parent,
  onClick,
  style,
  hideDescription,
  cache,
  width,
}) => {
  return (
    <CellMeasurer cache={cache} parent={parent} index={index}>
      {({ measure, registerChild }) => {
        return (
          <MediaListItemRef
            ref={registerChild}
            onLoad={measure}
            item={item}
            hideDescription={hideDescription}
          />
        );
      }}
    </CellMeasurer>
  );
};

export interface MediaListProps extends MasonryProps {
  className?: string;
  media: Media[];
  hideDescription?: boolean;
  onItemClick: (item: Media) => void;
  style?: React.CSSProperties;
  itemStyle?: React.CSSProperties;
  onRowsRendered?: ((info: RenderedRows) => void) | undefined;
  columnWidth: number;
  gutterSize?: number;
}

const LIST_PREFIX = "media-list";
const listClasses = {
  root: `${LIST_PREFIX}-root`,
};

const StyledMasonry = styled(Masonry)(() => ({
  [`&.${listClasses.root}`]: {
    paddingRight: 0,
    paddingLeft: 0,
  },
}));

export const MediaList = React.forwardRef<Masonry, MediaListProps>(
  (
    {
      className,
      media,
      style,
      hideDescription,
      onItemClick,
      itemStyle,
      onRowsRendered,
      width,
      columnWidth,
      gutterSize = 20,
      ...props
    },
    ref
  ) => {
    const masonryRef = React.useRef<Masonry>();

    const getColumnCount = (w: number): number =>
      Math.floor(w / (columnWidth + gutterSize));

    const [columnCount, setColumnCount] = React.useState(getColumnCount(width));
    const cellCache = React.useMemo(
      () =>
        new CellMeasurerCache({
          fixedWidth: true,
          defaultHeight: 200,
          defaultWidth: 200,
        }),
      []
    );

    const cellPositioner = React.useMemo((): Positioner => {
      return createCellPositioner({
        cellMeasurerCache: cellCache,
        columnCount,
        columnWidth,
        spacer: gutterSize,
      });
    }, []);

    const resetCellPositioner = (): void => {
      cellPositioner.reset({
        columnCount,
        columnWidth,
        spacer: gutterSize,
      });
    };

    const onResize = ({ width, height }: Size): void => {
      setColumnCount(getColumnCount(width));
      resetCellPositioner();
      masonryRef.current?.recomputeCellPositions();
    };

    return (
      <AutoSizer onResize={onResize}>
        {({ width, height }) => {
          return (
            <StyledMasonry
              {...props}
              className={clsx(listClasses.root, className)}
              height={height}
              width={width}
              style={style}
              ref={(i) => {
                if (typeof ref === "function") {
                  ref(i);
                }
                masonryRef.current = i ?? undefined;
              }}
              columnCount={columnCount}
              cellMeasurerCache={cellCache}
              cellCount={media.length}
              cellPositioner={cellPositioner}
              overscanByPixels={0}
              onCellsRendered={({ startIndex, stopIndex }) => {
                onRowsRendered?.({
                  startIndex,
                  stopIndex,
                  overscanStartIndex: stopIndex,
                  overscanStopIndex: stopIndex + 20,
                });
              }}
              cellRenderer={({ key, index, ...props }) => {
                const m = media[index % media.length];

                return (
                  <MediaListItemCell
                    {...props}
                    key={key}
                    cache={cellCache}
                    index={index}
                    onClick={onItemClick}
                    item={m}
                    hideDescription={hideDescription}
                    width={columnWidth}
                  />
                );
              }}
            />
          );
        }}
      </AutoSizer>
    );
  }
);
