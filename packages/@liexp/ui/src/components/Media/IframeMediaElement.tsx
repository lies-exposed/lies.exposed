import { Media } from "@liexp/shared/io/http";
import { makeStyles } from "@material-ui/core";
import clsx from "clsx";
import * as React from "react";

const useStyles = makeStyles(() => ({
  iframe: {
    display: "flex",
    minHeight: 400,
    maxWidth: 800,
    width: "100%",
  },
}));

interface IframeMediaElementProps {
  media: Omit<Media.Media, "type"> & { type: Media.IframeVideoType };
  className?: string;
  style?: React.CSSProperties;
  onLoad?: () => void;
}

const IframeMediaElement: React.FC<IframeMediaElementProps> = ({
  media,
  onLoad,
  ...props
}) => {
  const classes = useStyles();
  const ref = React.useRef<HTMLIFrameElement | null>(null);
  const [loaded, setLoaded] = React.useState(false);

  return loaded ? (
    <iframe
      className={clsx(classes.iframe, props.className)}
      {...props}
      src={media.location}
      ref={ref}
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
      onLoad={onLoad}
    />
  ) : (
    <div
      onClick={(e) => {
        e.stopPropagation();
        setLoaded(true);
      }}
      style={props.style}
    >
      <img
        src={media.thumbnail}
        onLoad={onLoad}
        style={{
          width: "100%",
          height: "auto",
        }}
      />
    </div>
  );
};

export default IframeMediaElement;
