import { type Area } from "@liexp/shared/lib/io/http/Area.js";
import * as React from "react";
import { type AvatarSize } from "../Common/Avatar.js";
import { Typography } from "../mui/index.js";

export interface AreaChipProps {
  area: Area;
  avatarSize?: AvatarSize;
  displayLabel?: boolean;
  displayFeaturedMedia?: boolean;
  className?: string;
  style?: React.CSSProperties;
  avatarStyle?: React.CSSProperties;
  displayNameStyle?: React.CSSProperties;
  onClick?: (a: Area) => void;
}

export const AreaChip: React.FC<AreaChipProps> = ({
  area,
  avatarSize,
  displayLabel: displayFullName = false,
  displayFeaturedMedia: displayAvatar = true,
  onClick,
  style,
  avatarStyle,
  displayNameStyle,
  ...props
}) => {
  return (
    <span
      {...props}
      style={{
        display: "flex",
        alignItems: "center",
        cursor: "pointer",
        margin: 0,
        ...style,
      }}
      onClick={() => {
        onClick?.(area);
      }}
    >
      {displayFullName ? (
        <Typography variant="caption" style={displayNameStyle}>
          {area.label}
        </Typography>
      ) : null}
    </span>
  );
};
