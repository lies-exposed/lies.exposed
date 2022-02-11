import { Media } from "@econnessione/shared/io/http";
import { Box } from "@material-ui/core";
import * as React from "react";
import ExpandableImageElement from "./ExpandableImageElement";
import IframeMediaElement from "./IframeMediaElement";
import PDFMediaElement from "./PDFMediaElement";

interface MediaElementProps {
  media: Media.Media;
  style?: React.CSSProperties;
}

const MediaElement: React.FC<MediaElementProps> = ({ media, ...props }) => {
  const mediaElement = React.useMemo(() => {
    switch (media.type) {
      case Media.MediaType.types[5].value:
        return (
          <IframeMediaElement
            media={{ ...media, type: "iframe/video" }}
            style={{
              width: "100%",
              minWidth: 400,
              maxWidth: 800,
              minHeight: 400,
              ...props.style,
            }}
          />
        );
      case Media.MediaType.types[4].value: {
        return (
          <PDFMediaElement
            media={{ ...media, type: "application/pdf" }}
            style={props.style}
          />
        );
      }
      case Media.MediaType.types[3].value: {
        return (
          <Box>
            <video
              src={media.location}
              style={{
                width: "100%",
                minWidth: 400,
                maxWidth: 800,
                minHeight: 400,
                ...props.style,
              }}
              controls={true}
              autoPlay={false}
            />
          </Box>
        );
      }
      default:
        return (
          <ExpandableImageElement media={media as any} style={props.style} />
        );
    }
  }, [media]);

  return mediaElement;
};

export default MediaElement;
