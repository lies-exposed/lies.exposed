import { type Group } from "@liexp/shared/lib/io/http/Group";
import * as O from "fp-ts/Option";
import { pipe } from "fp-ts/lib/function";
import * as React from "react";
import { Avatar, type AvatarSize } from "../Common/Avatar";
import { Typography } from "../mui";

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
      onClick={() => { onClick?.(group); }}
    >
      {pipe(
        O.fromNullable(group.avatar),
        O.map((src) => (
          <Avatar
            key={group.id}
            src={src}
            size={avatarSize}
            style={{ margin: 5, ...avatarStyle }}
          />
        )),
        O.toNullable
      )}
      {displayFullName ? (
        <Typography variant="caption" style={displayNameStyle}>
          {group.name}
        </Typography>
      ) : null}
    </span>
  );
};
