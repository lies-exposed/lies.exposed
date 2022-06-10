import { Media } from "@liexp/shared/io/http";
import clsx from "clsx";
import * as React from "react";
import { styled } from "../../theme";

const PREFIX = "IframeMediaElement";

const classes = {
  iframe: `${PREFIX}-iframe`,
};

const Root = styled("div")(() => ({
  [`& .${classes.iframe}`]: {
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
  const ref = React.useRef<HTMLIFrameElement | null>(null);
  const [loaded, setLoaded] = React.useState(false);

  return (
    <Root>
      {loaded ? (
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
          style={{
            ...props.style,
            background: `url(${media.thumbnail}) no-repeat center center`,
            backgroundSize: "contain",
          }}
          onLoad={onLoad}
        />
      )}
    </Root>
  );
};

export default IframeMediaElement;
