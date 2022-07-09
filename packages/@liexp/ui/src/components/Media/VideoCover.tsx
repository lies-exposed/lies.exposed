import * as React from "react";
import { PlayCircleOutline } from "../mui";

interface VideoCoverProps {
  thumbnail?: string;
  onClick: React.MouseEventHandler<HTMLDivElement>;
  style?: React.CSSProperties;
  onLoad?: () => void;
}

export const VideoCover: React.FC<VideoCoverProps> = ({
  thumbnail,
  onClick,
  style,
  onLoad,
}) => {
  return (
    <div
      onClick={onClick}
      style={{
        ...style,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: `url(${thumbnail}) no-repeat center center`,
        backgroundSize: "contain",
        cursor: "pointer",
      }}
      onLoad={onLoad}
    >
      <PlayCircleOutline style={{ color: "white" }} fontSize="large" />
    </div>
  );
};
