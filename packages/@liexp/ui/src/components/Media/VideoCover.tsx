import * as React from "react";
import { Icons } from "../mui/index.js";

interface VideoCoverProps {
  thumbnail?: string;
  onClick: React.MouseEventHandler<HTMLDivElement>;
  style?: React.CSSProperties;
  onLoad?: (rect: DOMRect) => void;
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
  const ref = React.useRef<HTMLDivElement | null>(null);
  React.useEffect(() => {
    if (ref.current) {
      const img = ref.current.getBoundingClientRect();
      onLoad?.(img);
    }
  }, [ref]);

  return (
    <div
      ref={ref}
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
        <Icons.PlayCircleOutline style={{ color: "white" }} fontSize="large" />
      ) : null}
    </div>
  );
};
