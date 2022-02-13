import { MP4Type } from "@econnessione/shared/io/http/Media";
import * as React from "react";

interface VideoProps {
  src: string;
  type: MP4Type;
  controls: boolean;
  autoPlay: boolean;
  muted: boolean;
  loop: boolean;
  style?: React.CSSProperties;
}

export const Video: React.FC<VideoProps> = ({
  src,
  type,
  controls,
  autoPlay,
  loop,
  muted,
  style,
}) => {
  const [loaded, setLoaded] = React.useState(true);

  return (
    <div className="video" style={style} onClick={() => setLoaded(true)}>
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
        <div>{"load video"}</div>
      )}
    </div>
  );
};
