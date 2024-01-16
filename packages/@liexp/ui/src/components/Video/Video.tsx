import { type MP4Type } from "@liexp/shared/lib/io/http/Media.js";
import { clsx } from "clsx";
import * as React from "react";
import { styled } from "../../theme/index.js";
import { VideoCover } from "../Media/VideoCover.js";

const PREFIX = "Video";

const classes = {
  wrapper: `${PREFIX}-wrapper`,
};

const Root = styled("div")(() => ({
  [`&.${classes.wrapper}`]: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    maxWidth: 800,
    minHeight: 300,
  },
}));

interface VideoProps {
  className?: string;
  thumbnail?: string;
  src: string;
  type: MP4Type;
  controls: boolean;
  autoPlay: boolean;
  muted: boolean;
  loop: boolean;
  style?: React.CSSProperties;
  onLoad?: () => void;
  disableZoom?: boolean;
  showPlay?: boolean;
  onClick?: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
}

export const Video: React.FC<VideoProps> = ({
  className,
  thumbnail,
  src,
  type,
  controls,
  autoPlay,
  loop,
  muted,
  style,
  onLoad,
  onClick,
  disableZoom = false,
  showPlay = true,
}) => {
  const [loaded, setLoaded] = React.useState(false);

  const showVideo = loaded && !disableZoom;
  return (
    <Root
      className={clsx(classes.wrapper, className)}
      style={style}
      onClick={() => {
        setLoaded(true);
      }}
    >
      {showVideo ? (
        <video
          controls={controls}
          autoPlay={autoPlay}
          loop={loop}
          muted={muted}
          controlsList="nodownload"
          style={{
            width: "100%",
            height: "auto",
          }}
        >
          <source src={src} type={type} />
        </video>
      ) : (
        <VideoCover
          thumbnail={thumbnail}
          showPlay={showPlay}
          onClick={(e) => {
            if (onClick) {
              onClick(e);
            } else if (disableZoom && !loaded) {
              e.stopPropagation();
              setLoaded(true);
            }
          }}
          style={{
            width: "100%",
            height: "100%",
            flexGrow: 1,
            ...style,
          }}
          onLoad={onLoad}
        />
      )}
    </Root>
  );
};
