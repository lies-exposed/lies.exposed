import { type Actor } from "@liexp/shared/lib/io/http/Actor.js";
import * as O from "fp-ts/lib/Option.js";
import { pipe } from "fp-ts/lib/function.js";
import * as React from "react";
import { Avatar, type AvatarSize } from "../Common/Avatar.js";
import { Typography } from "../mui/index.js";

export interface ActorChipProps {
  actor: Actor;
  avatarSize?: AvatarSize;
  displayFullName?: boolean;
  displayAvatar?: boolean;
  className?: string;
  style?: React.CSSProperties;
  avatarStyle?: React.CSSProperties;
  displayNameStyle?: React.CSSProperties;
  onClick?: (a: Actor) => void;
}

export const ActorChip: React.FC<ActorChipProps> = ({
  actor,
  avatarSize,
  displayFullName = false,
  displayAvatar = true,
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
        onClick?.(actor);
      }}
    >
      {pipe(
        O.fromNullable(displayAvatar ? actor.avatar : null),
        O.map((src) => (
          <Avatar
            key={actor.id}
            src={src}
            size={avatarSize}
            style={{ margin: 5, ...avatarStyle }}
          />
        )),
        O.toNullable,
      )}
      {displayFullName ? (
        <Typography variant="caption" style={displayNameStyle}>
          {actor.fullName}
        </Typography>
      ) : null}
    </span>
  );
};
