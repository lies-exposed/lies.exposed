import { Media } from "@econnessione/shared/io/http";
import * as React from "react";

interface MediaElementProps {
  media: Media.Media;
  style?: React.CSSProperties;
}

const MediaElement: React.FC<MediaElementProps> = (props) => {
  switch (props.media.type) {
    case Media.MediaType.types[5].value:
      return <iframe src={props.media.location} {...props} />;
    case Media.MediaType.types[4].value: {
      return <div style={props.style}>PDF preview</div>;
    }
    case Media.MediaType.types[3].value: {
      return (
        <video
          src={props.media.location}
          style={props.style}
          controls={true}
          autoPlay={false}
        />
      );
    }
    default:
      return <img src={props.media.location} style={props.style} />;
  }
};

export default MediaElement;
