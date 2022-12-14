import * as io from "@liexp/shared/io/http";
import { clsx } from "clsx";
import * as React from "react";
import { styled } from "../../theme";
import { ListItemProps } from "../Common/List";
import { defaultImage } from "../SEO";
import { Box, Grid, ListProps, Typography } from "../mui";

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

const StyledGridItem = styled(Grid)({
  [`&.${classes.root}`]: {
    width: "100%",
    maxWidth: 300,
    marginBottom: 20,
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
}) as typeof Grid;

interface MediaListItemProps extends ListItemProps<Media> {
  style?: React.CSSProperties;
  hideDescription?: boolean;
}

export const MediaListItem: React.FC<MediaListItemProps> = ({
  item,
  onClick,
  style,
  hideDescription,
}) => {
  return (
    <StyledGridItem
      key={item.id}
      className={clsx(classes.root)}
      display="flex"
      item
      sx={{ md: 3, sm: 6 }}
      alignItems="center"
      margin={0}
      style={{ cursor: "pointer", flexDirection: "column", ...style }}
      onClick={() => onClick?.(item)}
    >
      <Box className={classes.wrapper}>
        <img
          className={classes.media}
          src={item.thumbnail ?? defaultImage}
          title={item.description}
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

export interface MediaListProps extends ListProps {
  className?: string;
  media: Media[];
  hideDescription?: boolean;
  onItemClick: (item: Media) => void;
  style?: React.CSSProperties;
  itemStyle?: React.CSSProperties;
}

const LIST_PREFIX = "media-list";
const listClasses = {
  root: `${LIST_PREFIX}-root`,
};

const StyledList = styled(Grid)(() => ({
  [`&.${listClasses.root}`]: {
    display: "flex",
    flexDirection: "row",
    paddingRight: 0,
  },
})) as typeof Grid;

export const MediaList: React.FC<MediaListProps> = ({
  className,
  media,
  style,
  hideDescription,
  onItemClick,
  itemStyle,
  ...props
}) => {
  return (
    <StyledList
      {...props}
      container
      alignItems="center"
      justifyItems="center"
      spacing={2}
      className={clsx(listClasses.root, className)}
      component="ul"
      style={style}
    >
      {media.map((m) => (
        <MediaListItem
          key={m.id}
          onClick={onItemClick}
          item={{ ...m }}
          style={itemStyle}
          hideDescription={hideDescription}
        />
      ))}
    </StyledList>
  );
};
