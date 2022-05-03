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
  onLoad?: () => void;
}

const MediaElement: React.FC<MediaElementProps> = ({
  media,
  className,
  style,
  ...props
}) => {
  const mediaElement = React.useMemo(() => {
    const commonStyle = {
      width: "100%",
      maxWidth: 800,
      minHeight: 400,
    };

    switch (media.type) {
      case Media.MediaType.types[5].value:
        return (
          <IframeMediaElement
            {...props}
            className={className}
            media={{ ...media, type: "iframe/video" }}
            style={{
              ...commonStyle,
              ...style,
            }}
          />
        );
      case Media.MediaType.types[4].value: {
        return (
          <PDFMediaElement
            {...props}
            className={className}
            media={{ ...media, type: "application/pdf" }}
            style={{ ...commonStyle, ...style }}
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
            style={{
              ...commonStyle,
              ...style,
            }}
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

  return mediaElement;
};

export default MediaElement;
