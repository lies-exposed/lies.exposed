import type * as io from "@liexp/shared/lib/io/http/index.js";
import { Masonry } from "@mui/lab";
import { clsx } from "clsx";
import * as React from "react";
import { AutoSizer } from "react-virtualized";
import { styled } from "../../theme/index.js";
import { type ListItemProps } from "../Common/List.js";
import MediaElement, { type MediaElementProps } from "../Media/MediaElement.js";
import { Box } from "../mui/index.js";

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

const StyledBox = styled(Box)({
  [`&.${classes.root}`]: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
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
    alignItems: "center",
    overflow: "hidden",
  },
  [`& .${classes.media}`]: {
    maxWidth: "100%",
    width: "100%",
    // height: "100%",
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

type MediaListItemProps = ListItemProps<Media> &
  Omit<MediaElementProps, "media">;

export const MediaListItem: React.ForwardRefRenderFunction<
  any,
  MediaListItemProps
> = (
  { style, onClick, item, enableDescription, disableZoom, onLoad, itemStyle },
  ref,
) => {
  return (
    <StyledBox className={clsx(classes.root)} style={style} ref={ref}>
      <Box
        className={clsx(classes.wrapper)}
        style={{
          cursor: "pointer",
          display: "flex",
          flexDirection: "column",
        }}
        onClick={(e) => onClick?.(item, e)}
      >
        <MediaElement
          className={classes.media}
          media={item}
          enableDescription={enableDescription}
          disableZoom={disableZoom}
          style={style}
          itemStyle={itemStyle}
          onClick={
            onClick
              ? (e: any) => {
                  onClick?.(item, e);
                }
              : undefined
          }
          options={{ iframe: { showPlay: false }, video: { showPlay: false } }}
          onLoad={onLoad}
        />
      </Box>
    </StyledBox>
  );
};

export const MediaListItemRef = React.forwardRef(MediaListItem);

export const MediaListItemCell: React.FC<MediaListItemProps> = ({
  item,
  onClick,
  style,
  index,
  ...props
}) => {
  const [h, setHeight] = React.useState(
    props.itemStyle?.height ?? props.itemStyle?.maxHeight ?? "auto",
  );

  const handleLoad = React.useCallback(
    (rect: DOMRect) => {
      if (rect.height !== h) {
        const newHeight = (rect.height * rect.width) / rect.width;
        setHeight(newHeight);
      }
      props.onLoad?.(rect);
    },
    [props.onLoad, h],
  );

  return (
    <MediaListItemRef
      {...props}
      item={item}
      style={{
        ...style,
        height: h,
      }}
      onClick={onClick}
      onLoad={handleLoad}
    />
  );
};

export interface MediaListProps {
  className?: string;
  media: Media[];
  enableDescription?: boolean;
  disableZoom?: boolean;
  onItemClick?: (item: Media) => void;
  style?: React.CSSProperties;
  itemStyle?: React.CSSProperties;
  gutterSize?: number;
  columns?: number;
}

const LIST_PREFIX = "media-list";
const listClasses = {
  root: `${LIST_PREFIX}-root`,
};

const StyledMasonry = styled(Masonry)(() => ({
  [`&.${listClasses.root}`]: {
    width: "100%",
    paddingRight: 0,
    paddingLeft: 0,
    margin: 0,
  },
}));

export const MediaList = React.forwardRef<any, MediaListProps>(
  (
    {
      className,
      media,
      style,
      onItemClick,
      itemStyle,
      gutterSize = 20,
      columns = 4,
      enableDescription,
      disableZoom = true,
    },
    ref,
  ) => {
    const wrapperMaxHeight = style?.maxHeight ?? style?.height ?? "100%";

    const minHeight =
      itemStyle?.minHeight ??
      itemStyle?.height ??
      style?.minHeight ??
      style?.height ??
      400;

    // React.useEffect(() => {
    //   console.log("ref", ref);
    // }, []);

    return (
      <AutoSizer
        style={{
          width: "100%",
          height: "100%",
          minHeight,
          maxHeight: wrapperMaxHeight,
        }}
      >
        {({ height, width }) => {
          const columnWidth = Math.floor(width / columns);
          return (
            <StyledMasonry
              ref={ref}
              className={clsx(listClasses.root, className)}
              style={{
                overflow: "auto",
                ...style,
                height: "100%",
              }}
              columns={columns}
              spacing={1}
              defaultColumns={4}
              defaultHeight={height}
            >
              {media.map((m) => {
                return (
                  <MediaListItemCell
                    key={m.id}
                    item={m}
                    onClick={onItemClick}
                    enableDescription={enableDescription}
                    disableZoom={disableZoom}
                    style={{ ...itemStyle, width: columnWidth }}
                  />
                );
              })}
            </StyledMasonry>
          );
        }}
      </AutoSizer>
    );
  },
);
