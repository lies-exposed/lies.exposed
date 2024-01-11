import type * as io from "@liexp/shared/lib/io/http";
import Masonry from "@mui/lab/Masonry";
import { ParentSize } from "@visx/responsive";
import { clsx } from "clsx";
import * as React from "react";
import { styled } from "../../theme";
import { type ListItemProps } from "../Common/List";
import MediaElement from "../Media/MediaElement";
import { Box } from "../mui";

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

interface MediaListItemProps extends ListItemProps<Media> {
  style?: React.CSSProperties;
  hideDescription?: boolean;
  disableZoom?: boolean;
}

export const MediaListItem: React.ForwardRefRenderFunction<
  any,
  MediaListItemProps
> = ({ style, onClick, item, hideDescription, disableZoom }, ref) => {
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
          enableDescription={!hideDescription}
          disableZoom={disableZoom}
          onClick={
            onClick
              ? (e: any) => {
                  onClick(item, e);
                }
              : undefined
          }
          options={{ iframe: { showPlay: false }, video: { showPlay: false } }}
        />
      </Box>
    </StyledBox>
  );
};

export const MediaListItemRef = React.forwardRef(MediaListItem);

const MEDIA_MIN_HEIGHT = 100;
export const MediaListItemCell: React.FC<
  MediaListItemProps & { width: number }
> = ({ item, onClick, style, index, width, ...props }) => {
  const [h, setHeight] = React.useState(MEDIA_MIN_HEIGHT);

  React.useEffect(() => {
    if (width === 0) {
      return;
    }

    if (typeof window !== "undefined") {
      const img = new Image();

      img.onload = () => {
        const newHeight = (img.height * width) / img.width;
        setHeight(newHeight);
      };

      img.onerror = () => {};
      if (item.thumbnail) {
        img.src = item.thumbnail;
      }
    }
  }, [width]);

  return (
    <MediaListItemRef
      {...props}
      item={item}
      style={{
        ...style,
        width,
        height: h < MEDIA_MIN_HEIGHT ? MEDIA_MIN_HEIGHT : h,
      }}
      onClick={onClick}
    />
  );
};

export interface MediaListProps {
  className?: string;
  media: Media[];
  hideDescription?: boolean;
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
  },
}));

// eslint-disable-next-line react/display-name
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
      hideDescription = true,
      disableZoom = true,
    },
    ref,
  ) => {
    const maxHeight =
      style?.maxHeight ??
      style?.height ??
      itemStyle?.maxHeight ??
      itemStyle?.height;

    return (
      <ParentSize
        style={{
          width: "100%",
          maxHeight,
          minHeight: 50,
        }}
      >
        {({ height, width }) => {
          return (
            <StyledMasonry
              className={clsx(listClasses.root, className)}
              style={{ height: "100%", maxHeight, overflow: "auto", ...style }}
              columns={columns}
              spacing={1}
              defaultColumns={columns}
              defaultHeight={height}
            >
              {media.map((m) => {
                return (
                  <MediaListItemCell
                    key={m.id}
                    item={m}
                    onClick={onItemClick}
                    width={Math.floor(width / columns)}
                    hideDescription={hideDescription}
                    disableZoom={disableZoom}
                    style={itemStyle}
                  />
                );
              })}
            </StyledMasonry>
          );
        }}
      </ParentSize>
    );
  },
);
