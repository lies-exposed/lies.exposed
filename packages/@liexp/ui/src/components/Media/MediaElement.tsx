import { Media } from "@liexp/shared/io/http";
import * as React from "react";
import { styled } from "../../theme";
import { Video } from "../Video/Video";
import { Box, Typography } from "../mui";
import ExpandableImageElement from "./ExpandableImageElement";
import IframeMediaElement from "./IframeMediaElement";
import PDFMediaElement from "./PDFMediaElement";

const MEDIA_ELEMENT_PREFIX = "media-element";

const classes = {
  root: `${MEDIA_ELEMENT_PREFIX}-root`,
  description: `${MEDIA_ELEMENT_PREFIX}-description`,
};

const StyledBox = styled(Box)(() => ({
  [`&.${classes.root}`]: {
    position: "relative",
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

interface MediaElementProps {
  media: Media.Media;
  className?: string;
  style?: React.CSSProperties;
  onLoad?: () => void;
  enableDescription?: boolean;
}

const MediaElement: React.FC<MediaElementProps> = ({
  media,
  className,
  style,
  enableDescription = false,
  ...props
}) => {
  const mediaElement = React.useMemo(() => {
    const commonStyle = {
      width: "100%",
      maxWidth: 800,
      minHeight: 300,
      margin: "auto",
      ...style,
    };

    switch (media.type) {
      case Media.MediaType.types[5].value:
        return (
          <IframeMediaElement
            {...props}
            className={className}
            media={{ ...media, type: "iframe/video" }}
            style={commonStyle}
          />
        );
      case Media.MediaType.types[4].value: {
        return (
          <PDFMediaElement
            {...props}
            className={className}
            media={{ ...media, type: "application/pdf" }}
            style={commonStyle}
          />
        );
      }
      case Media.MediaType.types[3].value: {
        return (
          <Video
            {...props}
            className={className}
            thumbnail={media.thumbnail}
            src={media.location}
            type={"video/mp4"}
            muted={false}
            loop={false}
            controls={true}
            autoPlay={false}
            style={commonStyle}
          />
        );
      }
      default:
        return (
          <ExpandableImageElement
            {...props}
            className={className}
            media={media as any}
            style={{ ...commonStyle, ...style }}
          />
        );
    }
  }, [media]);

  return (
    <StyledBox className={classes.root}>
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
