import type * as io from "@liexp/shared/io/http";
import Masonry from "@mui/lab/Masonry";
import { clsx } from "clsx";
import * as React from "react";
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

const StyledBox = styled(Box)({
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
}

export const MediaListItem: React.ForwardRefRenderFunction<
  any,
  MediaListItemProps
> = ({ style, onClick, item, hideDescription }, ref) => {
  return (
    <StyledBox className={clsx(classes.root)} style={style} ref={ref}>
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
    </StyledBox>
  );
};

export const MediaListItemRef = React.forwardRef(MediaListItem);

export const MediaListItemCell: React.FC<
  MediaListItemProps & { width: number }
> = ({ item, onClick, style, hideDescription, width }) => {
  let height = 100;
  if (typeof window !== "undefined") {
    const img = new Image();
    if (item.thumbnail) {
      img.src = item.thumbnail;
    }

    height = (img.height * 300) / img.width;
  }

  return (
    <MediaListItemRef
      item={item}
      hideDescription={hideDescription}
      style={{
        ...style,
        width,
        height: height < 50 ? 50 : height,
      }}
      onClick={onClick}
    />
  );
};

export interface MediaListProps {
  className?: string;
  media: Media[];
  hideDescription?: boolean;
  onItemClick: (item: Media) => void;
  style?: React.CSSProperties;
  itemStyle?: React.CSSProperties;
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

// eslint-disable-next-line react/display-name
export const MediaList = React.forwardRef<any, MediaListProps>(
  (
    {
      className,
      media,
      style,
      hideDescription,
      onItemClick,
      itemStyle,
      gutterSize = 20,
      ...props
    },
    ref
  ) => {
    const columnWidth = 300;

    // const getColumnCount = (w: number): number =>
    //   Math.floor(w / (columnWidth + gutterSize));

    // const [columnCount, setColumnCount] = React.useState(
    //   getColumnCount(width > 0 ? width : 1000)
    // );

    // React.useEffect(() => {
    //   setTimeout(() => {
    //     resetCellPositioner();
    //     masonryRef.current?.recomputeCellPositions();
    //   }, 1000);
    // }, [media.map((m) => m.id)]);

    return (
      <StyledMasonry
        {...props}
        className={clsx(listClasses.root, className)}
        style={style}
        columns={4}
        spacing={1}
        defaultColumns={4}
        defaultHeight={600}
      >
        {media.map((m) => {
          return (
            <MediaListItemCell
              {...props}
              key={m.id}
              item={m}
              onClick={onItemClick}
              hideDescription={hideDescription}
              width={columnWidth}
            />
          );
        })}
      </StyledMasonry>
    );
  }
);
