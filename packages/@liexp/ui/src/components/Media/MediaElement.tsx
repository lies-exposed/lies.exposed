import { Media } from "@liexp/shared/io/http";
import * as React from "react";
import { Video } from "../Video/Video";
import ExpandableImageElement from "./ExpandableImageElement";
import IframeMediaElement from "./IframeMediaElement";
import PDFMediaElement from "./PDFMediaElement";

interface MediaElementProps {
  media: Media.Media;
  className?: string;
  style?: React.CSSProperties;
}

const MediaElement: React.FC<MediaElementProps> = ({
  media,
  className,
  ...props
}) => {
  const mediaElement = React.useMemo(() => {
    const commonStyle = {
      width: "100%",
      minWidth: 400,
      maxWidth: 800,
      minHeight: 400,
    };

    switch (media.type) {
      case Media.MediaType.types[5].value:
        return (
          <IframeMediaElement
            className={className}
            media={{ ...media, type: "iframe/video" }}
            style={{
              ...commonStyle,
              ...props.style,
            }}
          />
        );
      case Media.MediaType.types[4].value: {
        return (
          <PDFMediaElement
            className={className}
            media={{ ...media, type: "application/pdf" }}
            style={{ ...commonStyle, ...props.style }}
          />
        );
      }
      case Media.MediaType.types[3].value: {
        return (
          <Video
            className={className}
            src={media.location}
            type={"video/mp4"}
            muted={false}
            loop={false}
            controls={true}
            autoPlay={false}
            style={{
              ...commonStyle,
              ...props.style,
            }}
          />
        );
      }
      default:
        return (
          <ExpandableImageElement
            className={className}
            media={media as any}
            style={{ ...commonStyle, ...props.style }}
          />
        );
    }
  }, [media]);

  return mediaElement;
};

export default MediaElement;
