import { type Media } from "@liexp/shared/lib/io/http/index.js";
import { clsx } from "clsx";
import * as React from "react";
import { styled } from "../../theme/index.js";
import { VideoCover } from "./VideoCover.js";

const PREFIX = "IframeMediaElement";

const classes = {
  root: `${PREFIX}-root`,
  iframe: `${PREFIX}-iframe`,
  cover: `${PREFIX}-cover`,
};

const Root = styled("div")(() => ({
  [`&.${classes.root}`]: {
    minHeight: 300,
    objectFit: "contain",
  },
  [`& .${classes.iframe}`]: {
    display: "flex",
    height: "100%",
    width: "100%",
  },
  [`& .${classes.cover}`]: {
    display: "flex",
    height: "100%",
    width: "100%",
    maxWidth: 800,
    minHeight: 300,
    position: "absolute",
    margin: "auto",
    left: 0,
    right: 0,
  },
}));

interface IframeMediaElementProps {
  media: Omit<Media.Media, "type"> & { type: Media.IframeVideoType };
  className?: string;
  style?: React.CSSProperties;
  itemStyle?: React.CSSProperties;
  onLoad?: () => void;
  onClick?: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
  showPlay?: boolean;
}

const IframeMediaElement: React.FC<IframeMediaElementProps> = ({
  media,
  onLoad,
  style,
  itemStyle,
  className,
  onClick,
  showPlay = true,
  ...props
}) => {
  const ref = React.useRef<HTMLIFrameElement | null>(null);
  const [loaded, setLoaded] = React.useState(false);

  return (
    <Root className={clsx(classes.root, className)} style={style}>
      {loaded ? (
        <iframe
          className={classes.iframe}
          {...props}
          style={itemStyle}
          src={media.location}
          ref={ref}
          loading="lazy"
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
          style={itemStyle}
          showPlay={showPlay}
          onClick={(e) => {
            e.stopPropagation();
            if (onClick) {
              onClick(e);
            } else {
              setLoaded(true);
            }
          }}
          onLoad={onLoad}
        />
      )}
    </Root>
  );
};

export default IframeMediaElement;
