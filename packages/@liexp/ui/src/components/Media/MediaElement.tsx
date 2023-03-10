import { Media } from "@liexp/shared/io/http";
import { clsx } from "clsx";
import * as React from "react";
import { styled } from "../../theme";
import { Video } from "../Video/Video";
import { Box, Typography } from "../mui";
import AudioMediaElement from "./AudioMediaElement";
import ExpandableImageElement from "./ExpandableImageElement";
import IframeMediaElement from "./IframeMediaElement";
import PDFMediaElement from "./PDFMediaElement";

const MEDIA_ELEMENT_PREFIX = "media-element";

const classes = {
  root: `${MEDIA_ELEMENT_PREFIX}-root`,
  description: `${MEDIA_ELEMENT_PREFIX}-description`,
  item: `${MEDIA_ELEMENT_PREFIX}-item`,
};

const StyledBox = styled(Box)(() => ({
  [`&.${classes.root}`]: {
    position: "relative",
    height: "100%",
  },
  [`& .${classes.item}`]: {
    width: "100%",
    height: "100%",
    maxWidth: 800,
    maxHeight: 400,
    margin: "auto",
  },
  [`& .${classes.description}`]: {
    position: "absolute",
    backgroundColor: "black",
    padding: 10,
    bottom: 0,
    right: 0,
    left: 0,
  },
})) as typeof Box;

export interface MediaElementProps {
  media: Media.Media;
  className?: string;
  itemClassName?: string;
  style?: React.CSSProperties;
  onLoad?: () => void;
  enableDescription?: boolean;
}

const MediaElement: React.FC<MediaElementProps> = ({
  media,
  className,
  itemClassName,
  style,
  enableDescription = false,
  ...props
}) => {
  const mediaElement = React.useMemo(() => {
    switch (media.type) {
      case Media.MediaType.types[7].value:
        return (
          <IframeMediaElement
            {...props}
            className={clsx(classes.item, itemClassName)}
            media={{ ...media, type: "iframe/video" }}
          />
        );
      case Media.MediaType.types[6].value: {
        return (
          <PDFMediaElement
            {...props}
            className={clsx(classes.item, itemClassName)}
            media={{ ...media, type: "application/pdf" }}
          />
        );
      }
      case Media.MediaType.types[5].value: {
        return (
          <Video
            {...props}
            className={clsx(classes.item, itemClassName)}
            thumbnail={media.thumbnail}
            src={media.location}
            type={"video/mp4"}
            muted={false}
            loop={false}
            controls={true}
            autoPlay={false}
          />
        );
      }
      case Media.MediaType.types[4].value:
      case Media.MediaType.types[3].value: {
        return (
          <AudioMediaElement
            className={clsx(classes.item, itemClassName)}
            media={media as any}
          />
        );
      }

      default:
        return (
          <ExpandableImageElement
            {...props}
            className={clsx(classes.item, itemClassName)}
            media={media as any}
          />
        );
    }
  }, [media]);

  return (
    <StyledBox className={clsx(classes.root, className)} style={style}>
      {mediaElement}
      {enableDescription ? (
        <Box className={classes.description}>
          <Typography gutterBottom variant="body2" component="p" color="white">
            {media.description.substring(0, 100)}
          </Typography>
        </Box>
      ) : null}
    </StyledBox>
  );
};

export default MediaElement;
