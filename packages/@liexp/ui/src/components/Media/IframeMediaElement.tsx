import { Media } from "@liexp/shared/io/http";
import * as React from "react";

interface IframeMediaElementProps {
  media: Omit<Media.Media, "type"> & { type: Media.IframeVideoType };
  style?: React.CSSProperties;
}

const IframeMediaElement: React.FC<IframeMediaElementProps> = ({
  media,
  ...props
}) => {
  const ref = React.useRef<HTMLIFrameElement | null>(null);
  const [loaded, setLoaded] = React.useState(true);

  return loaded ? (
    <iframe
      {...props}
      src={media.location}
      ref={ref}
      style={{
        display: "flex",
        minHeight: 400,
        maxWidth: 800,
        width: "100%",
        ...props.style,
      }}
      loading="lazy"
      allowFullScreen={true}
      // sandbox=""
      // onLoad={(e) => {
      // console.log('on load', e);
      // ref.current?.src = "";
      // e.preventDefault();
      // }}
      // onLoadCapture={(e) => {
      // console.log('on load capture', e);
      // e.preventDefault();
      // }}
      onError={(e) => {
        // console.log('on error', e)
      }}
      onErrorCapture={(e) => {
        // console.log("on error capture", e);
        // e.preventDefault();
      }}
    />
  ) : (
    <div onClick={() => setLoaded(true)} style={props.style}>
      {media.description}
    </div>
  );
};

export default IframeMediaElement;
