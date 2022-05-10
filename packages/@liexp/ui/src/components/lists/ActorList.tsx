import * as io from "@liexp/shared/io/http";
import { Box, Typography } from "@mui/material";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import * as React from "react";
import { Avatar, AvatarSize } from "../Common/Avatar";
import { List, ListItemProps } from "../Common/List";

export interface Actor extends io.Actor.Actor {
  selected: boolean;
}

export const ActorListItem: React.FC<
  ListItemProps<Actor> & {
    avatarSize?: AvatarSize;
    displayFullName?: boolean;
    style?: React.CSSProperties;
  }
> = ({ item, avatarSize, displayFullName = false, onClick, style }) => {
  return (
    <Box
      key={item.id}
      display="flex"
      alignItems="center"
      margin={0}
      style={{ cursor: "pointer", ...style }}
      onClick={() => onClick?.(item)}
    >
      {pipe(
        O.fromNullable(item.avatar),
        O.map((src) => (
          <Avatar
            key={item.id}
            src={src}
            size={avatarSize}
            style={{ margin: 5 }}
          />
        )),
        O.toNullable
      )}
      {displayFullName ? (
        <Typography variant="caption"> {item.fullName}</Typography>
      ) : null}
      <Box display="flex">
        <div
          style={{
            width: "100%",
            height: 3,
            backgroundColor: item.selected ? item.color : "white",
          }}
        />
      </Box>
    </Box>
  );
};

interface ActorListProps {
  className?: string;
  actors: Actor[];
  onActorClick: (actor: Actor) => void;
  avatarSize?: AvatarSize;
  displayFullName?: boolean;
  style?: React.CSSProperties;
}

export const ActorList: React.FC<ActorListProps> = ({
  className,
  actors,
  onActorClick,
  avatarSize,
  style,
  displayFullName,
}) => {
  return (
    <List
      className={className}
      style={style}
      data={actors}
      getKey={(a) => a.id}
      filter={(a) => true}
      onItemClick={onActorClick}
      ListItem={(p) => (
        <ActorListItem
          avatarSize={avatarSize}
          displayFullName={displayFullName}
          {...p}
        />
      )}
    />
  );
};
