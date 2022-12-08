import { Actor } from "@liexp/shared/io/http/Actor";
import * as O from "fp-ts/Option";
import { pipe } from "fp-ts/lib/function";
import * as React from "react";
import { Avatar, AvatarSize } from "../Common/Avatar";
import { Typography } from "../mui";

export interface ActorChipProps {
  actor: Actor;
  avatarSize?: AvatarSize;
  displayFullName?: boolean;
  className?: string;
  style?: React.CSSProperties;
  avatarStyle?: React.CSSProperties;
  displayNameStyle?: React.CSSProperties;
  onClick: (a: Actor) => void;
}

export const ActorChip: React.FC<ActorChipProps> = ({
  actor,
  avatarSize,
  displayFullName = false,
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
      onClick={() => onClick?.(actor)}
    >
      {pipe(
        O.fromNullable(actor.avatar),
        O.map((src) => (
          <Avatar
            key={actor.id}
            src={src}
            size={avatarSize}
            style={{ margin: 5, ...avatarStyle }}
          />
        )),
        O.toNullable
      )}
      {displayFullName ? (
        <Typography variant="caption" style={displayNameStyle}>
          {actor.fullName}
        </Typography>
      ) : null}
    </span>
  );
};
