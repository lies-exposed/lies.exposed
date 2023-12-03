import * as React from "react";
import { PlayCircleOutline } from "../mui";

interface VideoCoverProps {
  thumbnail?: string;
  onClick: React.MouseEventHandler<HTMLDivElement>;
  style?: React.CSSProperties;
  onLoad?: () => void;
  className?: string;
  showPlay: boolean;
}

export const VideoCover: React.FC<VideoCoverProps> = ({
  className,
  thumbnail,
  onClick,
  style,
  onLoad,
  showPlay,
}) => {
  React.useEffect(() => {
    onLoad?.();
  }, []);

  return (
    <div
      className={className}
      onClick={onClick}
      style={{
        ...style,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: `url(${thumbnail}) no-repeat center center`,
        backgroundSize: "cover",
        cursor: "pointer",
        height: "100%",
      }}
    >
      {showPlay ? (
        <PlayCircleOutline style={{ color: "white" }} fontSize="large" />
      ) : null}
    </div>
  );
};
