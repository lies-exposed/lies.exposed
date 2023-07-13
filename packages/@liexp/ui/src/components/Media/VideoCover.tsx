import * as React from "react";
import { PlayCircleOutline } from "../mui";

interface VideoCoverProps {
  thumbnail?: string;
  onClick: React.MouseEventHandler<HTMLDivElement>;
  style?: React.CSSProperties;
  onLoad?: () => void;
  className?: string;
}

export const VideoCover: React.FC<VideoCoverProps> = ({
  className,
  thumbnail,
  onClick,
  style,
  onLoad,
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
      <PlayCircleOutline style={{ color: "white" }} fontSize="large" />
    </div>
  );
};
