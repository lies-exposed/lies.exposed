import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { type Group } from "@liexp/shared/lib/io/http/Group.js";
import * as React from "react";
import { Avatar, type AvatarSize } from "../Common/Avatar.js";
import { Typography } from "../mui/index.js";

export interface GroupChipProps {
  group: Group;
  avatarSize?: AvatarSize;
  displayName?: boolean;
  className?: string;
  style?: React.CSSProperties;
  avatarStyle?: React.CSSProperties;
  displayNameStyle?: React.CSSProperties;
  onClick?: (a: Group) => void;
}

export const GroupChip: React.FC<GroupChipProps> = ({
  group,
  avatarSize,
  displayName: displayFullName = false,
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
        onClick?.(group);
      }}
    >
      {pipe(
        fp.O.fromNullable(group.avatar),
        fp.O.map((src) => (
          <Avatar
            key={group.id}
            src={src}
            size={avatarSize}
            style={{ margin: 5, ...avatarStyle }}
          />
        )),
        fp.O.toNullable,
      )}
      {displayFullName ? (
        <Typography variant="caption" style={displayNameStyle}>
          {group.name}
        </Typography>
      ) : null}
    </span>
  );
};
