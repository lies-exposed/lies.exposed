import { MP4Type } from "@liexp/shared/io/http/Media";
import { makeStyles } from "@material-ui/core";
import * as React from "react";

const useStyles = makeStyles(() => ({
  wrapper: {
    display: "flex",
    width: "100%",
    maxWidth: 800,
    minHeight: 300,
    maxHeight: 400,
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
  const classes = useStyles();
  const [loaded, setLoaded] = React.useState(!(thumbnail !== undefined));

  return (
    <div
      className={classes.wrapper}
      style={style}
      onClick={() => setLoaded(true)}
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
        <div
          onClick={(e) => {
            e.stopPropagation();
            setLoaded(true);
          }}
          style={{
            ...style,
            background: `url(${thumbnail}) no-repeat center center`,
            backgroundSize: "contain",
          }}
          onLoad={onLoad}
        />
      )}
    </div>
  );
};
