import { Media } from "@liexp/shared/lib/io/http/index.js";
import { clsx } from "clsx";
import * as React from "react";
import { styled } from "../../theme/index.js";
import { Video } from "../Video/Video.js";
import { Box, Typography } from "../mui/index.js";
import AudioMediaElement from "./AudioMediaElement.js";
import ExpandableImageElement from "./ExpandableImageElement.js";
import IframeMediaElement from "./IframeMediaElement.js";
import PDFMediaElement from "./PDFMediaElement.js";

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
  onLoad?: (rect: DOMRect) => void;
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
  disableZoom = false,
  ...props
}) => {
  const mediaElement = React.useMemo(() => {
    switch (media.type) {
      case Media.IframeVideoType.Type:
        return (
          <IframeMediaElement
            {...props}
            showPlay={options?.iframe.showPlay}
            style={style}
            itemStyle={itemStyle}
            className={clsx(classes.item, itemClassName)}
            media={{ ...media, type: Media.IframeVideoType.Type }}
          />
        );
      case Media.PDFType.Type: {
        return (
          <PDFMediaElement
            {...props}
            style={itemStyle}
            className={clsx(classes.item, itemClassName)}
            media={{ ...media, type: Media.PDFType.Type }}
            disableOpen={disableZoom}
          />
        );
      }
      case Media.MP4Type.Type: {
        return (
          <Video
            {...props}
            showPlay={options?.video.showPlay}
            style={style}
            itemStyle={itemStyle}
            className={clsx(classes.item, itemClassName)}
            thumbnail={media.thumbnail}
            src={media.location}
            type={"video/mp4"}
            muted={false}
            loop={false}
            controls={true}
            autoPlay={false}
            disableZoom={disableZoom}
          />
        );
      }
      case Media.AudioType.members[0].Type:
      case Media.AudioType.members[1].Type: {
        return (
          <AudioMediaElement
            {...props}
            style={itemStyle}
            className={clsx(classes.item, itemClassName)}
            media={{ ...media, type: media.type as Media.AudioType }}
          />
        );
      }

      default:
        return (
          <ExpandableImageElement
            {...props}
            style={itemStyle}
            className={clsx(classes.item, itemClassName)}
            media={{ ...media, type: media.type as Media.ImageType }}
            disableZoom={disableZoom}
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
