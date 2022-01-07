import * as io from "@econnessione/shared/io/http";
import { Box, Typography } from "@material-ui/core";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/pipeable";
import * as React from "react";
import { Avatar, AvatarSize } from "../Common/Avatar";
import { List, ListItemProps } from "../Common/List";

export interface Actor extends io.Actor.Actor {
  selected: boolean;
}

export const ActorListItem: React.FC<
  ListItemProps<Actor> & { avatarSize?: AvatarSize; displayFullName?: boolean }
> = ({ item, avatarSize, displayFullName = false, onClick }) => {
  return (
    <Box
      key={item.id}
      display="flex"
      alignItems="center"
      margin={0}
      style={{ cursor: "pointer" }}
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
  actors: Actor[];
  onActorClick: (actor: Actor) => void;
  avatarSize?: AvatarSize;
  displayFullName?: boolean;
  style?: React.CSSProperties;
}

export const ActorList: React.FC<ActorListProps> = ({
  actors,
  onActorClick,
  avatarSize,
  style,
  displayFullName,
}) => {
  return (
    <List
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
