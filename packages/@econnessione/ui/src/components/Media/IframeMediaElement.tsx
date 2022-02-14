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
  const [loaded, setLoaded] = React.useState(true);

  return loaded ? (
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
      loading="lazy"
      allowFullScreen={true}
    />
  ) : (
    <div onClick={() => setLoaded(true)} style={props.style}>
      {media.description}
    </div>
  );
};

export default IframeMediaElement;
