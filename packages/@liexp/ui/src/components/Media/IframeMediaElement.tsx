import { type Media } from "@liexp/shared/io/http";
import { clsx } from "clsx";
import * as React from "react";
import { styled } from "../../theme";
import { VideoCover } from "./VideoCover";

const PREFIX = "IframeMediaElement";

const classes = {
  root: `${PREFIX}-root`,
  iframe: `${PREFIX}-iframe`,
  cover: `${PREFIX}-cover`,
};

const Root = styled("div")(() => ({
  [`&.${classes.root}`]: {},
  [`& .${classes.iframe}`]: {
    display: "flex",
    height: "100%",
    width: "100%",
  },
  [`& .${classes.cover}`]: {
    height: "100%",
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
  style,
  className,
  ...props
}) => {
  const ref = React.useRef<HTMLIFrameElement | null>(null);
  const [loaded, setLoaded] = React.useState(false);

  return (
    <Root className={clsx(classes.root, className)}>
      {loaded ? (
        <iframe
          className={classes.iframe}
          {...props}
          src={media.location}
          ref={ref}
          loading="lazy"
          style={style}
          allowFullScreen={true}
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
        <VideoCover
          className={classes.cover}
          thumbnail={media.thumbnail}
          onClick={(e) => {
            e.stopPropagation();
            setLoaded(true);
          }}
          onLoad={onLoad}
        />
      )}
    </Root>
  );
};

export default IframeMediaElement;
