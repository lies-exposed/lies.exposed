import { Avatar, AvatarSize } from "@components/Common/Avatar";
import { List, ListItemProps } from "@components/Common/List";
import * as io from "@io/http";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/pipeable";
import * as React from "react";

export interface Actor extends io.Actor.Actor {
  selected: boolean;
}

export const ActorListItem: React.FC<
  ListItemProps<Actor> & { avatarSize?: AvatarSize }
> = ({ item, avatarSize, onClick }) => {
  return (
    <div
      key={item.id}
      style={{ display: "inline-block", margin: 5, cursor: "pointer" }}
      onClick={() => onClick?.(item)}
    >
      {pipe(
        O.fromNullable(item.avatar),
        O.map((src) => <Avatar key={item.id} size={avatarSize} src={src} />),
        O.toNullable
      )}
      <div
        style={{
          width: "100%",
          height: 3,
          backgroundColor: item.selected ? item.color : "white",
        }}
      />
    </div>
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
