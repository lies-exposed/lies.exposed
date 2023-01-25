import { type MP4Type } from "@liexp/shared/io/http/Media";
import * as React from "react";
import { styled } from "../../theme";
import { VideoCover } from "../Media/VideoCover";

const PREFIX = "Video";

const classes = {
  wrapper: `${PREFIX}-wrapper`,
};

const Root = styled("div")(() => ({
  [`&.${classes.wrapper}`]: {
    display: "flex",
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
}

export const Video: React.FC<VideoProps> = ({
  thumbnail,
  src,
  type,
  controls,
  autoPlay,
  loop,
  muted,
  style,
  onLoad,
}) => {
  const [loaded, setLoaded] = React.useState(!(thumbnail !== undefined));

  return (
    <Root
      className={classes.wrapper}
      style={style}
      onClick={() => { setLoaded(true); }}
    >
      {loaded ? (
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
          onClick={(e) => {
            e.stopPropagation();
            setLoaded(true);
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
