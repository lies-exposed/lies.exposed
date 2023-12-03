import { Media } from "@liexp/shared/lib/io/http";
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
    margin: "auto",
    maxWidth: "100%",
    objectFit: "contain",
  },
  [`& .${classes.description}`]: {
    backgroundColor: "black",
    padding: 10,
  },
})) as typeof Box;

export interface MediaElementProps {
  media: Media.Media;
  className?: string;
  itemClassName?: string;
  style?: React.CSSProperties;
  itemStyle?: React.CSSProperties;
  onLoad?: () => void;
  enableDescription?: boolean;
  disableZoom?: boolean;
  onClick?: (e: any) => void;
  options?: {
    iframe: {
      showPlay: boolean;
    };
    video: {
      showPlay: boolean;
    };
  };
}

const MediaElement: React.FC<MediaElementProps> = ({
  media,
  className,
  itemClassName,
  style,
  itemStyle,
  enableDescription = false,
  options,
  ...props
}) => {
  const mediaElement = React.useMemo(() => {
    switch (media.type) {
      case Media.IframeVideoType.value:
        return (
          <IframeMediaElement
            {...props}
            showPlay={options?.iframe.showPlay}
            style={itemStyle}
            itemStyle={itemStyle}
            className={clsx(classes.item, itemClassName)}
            media={{ ...media, type: "iframe/video" }}
          />
        );
      case Media.MediaType.types[6].value: {
        return (
          <PDFMediaElement
            {...props}
            style={itemStyle}
            className={clsx(classes.item, itemClassName)}
            media={{ ...media, type: "application/pdf" }}
          />
        );
      }
      case Media.MediaType.types[5].value: {
        return (
          <Video
            {...props}
            showPlay={options?.video.showPlay}
            style={itemStyle}
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
            {...props}
            style={itemStyle}
            className={clsx(classes.item, itemClassName)}
            media={media as any}
          />
        );
      }

      default:
        return (
          <ExpandableImageElement
            {...props}
            style={itemStyle}
            className={clsx(classes.item, itemClassName)}
            media={media as any}
          />
        );
    }
  }, [media]);

  return (
    <StyledBox className={clsx(classes.root, className)} style={style}>
      <Box style={{ position: "relative", height: "100%" }}>{mediaElement}</Box>

      {enableDescription && media.description ? (
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
