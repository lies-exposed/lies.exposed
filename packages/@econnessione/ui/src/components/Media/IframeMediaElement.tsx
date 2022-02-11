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
      {...props}
      src={media.location}
      style={{
        display: "flex",
        minHeight: 300,
        maxWidth: 800,
        width: "100%",
        ...props.style,
      }}
      allowFullScreen={true}
    />
  );
};

export default IframeMediaElement;
