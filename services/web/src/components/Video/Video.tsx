import { Video as VideoIO } from "@econnessione/shared/lib/io/http";
import * as React from "react";

interface VideoProps {
  video: VideoIO.VideoFileNode;
  controls: boolean;
  autoPlay: boolean;
  muted: boolean;
  loop: boolean;
  style?: React.CSSProperties;
}

export const Video: React.FC<VideoProps> = ({
  video,
  controls,
  autoPlay,
  loop,
  muted,
  style,
}) => {
  return (
    <div className="video" style={style}>
      <video
        controls={controls}
        autoPlay={autoPlay}
        loop={loop}
        muted={muted}
        controlsList="nodownload"
      >
        <source src={video.publicURL} type={`video/${video.extension}`} />
      </video>
    </div>
  );
};
