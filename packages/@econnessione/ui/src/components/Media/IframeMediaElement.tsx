import { Media } from "@econnessione/shared/io/http";
import * as React from "react";

interface IframeMediaElementProps {
  media: Omit<Media.Media, "type"> & { type: Media.IframeVideoType };
  style?: React.CSSProperties;
}

const IframeMediaElement: React.FC<IframeMediaElementProps> = ({
  media,
  ...props
}) => {

  return (
    <iframe
      src={media.location}
      {...props}
      style={{ minHeight: 300, ...props.style }}
    />
  );
};

export default IframeMediaElement;
