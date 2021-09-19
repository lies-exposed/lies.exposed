import * as io from "@econnessione/shared/io/http";
import { Box } from "@material-ui/core";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/pipeable";
import * as React from "react";
import { Avatar, AvatarSize } from "@components/Common/Avatar";
import { List, ListItemProps } from "@components/Common/List";

export interface Actor extends io.Actor.Actor {
  selected: boolean;
}

export const ActorListItem: React.FC<
  ListItemProps<Actor> & { avatarSize?: AvatarSize; displayFullName?: boolean }
> = ({ item, avatarSize, displayFullName = false, onClick }) => {
  return (
    <Box
      key={item.id}
      style={{
        display: "flex",
        margin: 5,
        cursor: "pointer",
        flexDirection: "column",
      }}
      onClick={() => onClick?.(item)}
    >
      <Box style={{ display: "flex", width: "100%" }}>
        {pipe(
          O.fromNullable(item.avatar),
          O.map((src) => <Avatar key={item.id} size={avatarSize} src={src} />),
          O.toNullable
        )}
        {displayFullName ? (
          <div style={{ marginLeft: 10 }}>{item.fullName}</div>
        ) : null}
      </Box>
      <div
        style={{
          width: "100%",
          height: 3,
          backgroundColor: item.selected ? item.color : "white",
        }}
      />
    </Box>
  );
};

interface ActorListProps {
  actors: Actor[];
  onActorClick: (actor: Actor) => void;
  avatarSize?: AvatarSize;
}

export const ActorList: React.FC<ActorListProps> = ({
  actors,
  onActorClick,
  avatarSize,
}) => {
  return (
    <List
      data={actors}
      getKey={(a) => a.id}
      filter={(a) => true}
      onItemClick={onActorClick}
      ListItem={(p) => <ActorListItem avatarSize={avatarSize} {...p} />}
    />
  );
};
