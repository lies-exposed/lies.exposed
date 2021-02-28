import { List, ListItemProps } from "@components/Common/List";
import * as io from "@io/http";
import { Avatar } from "@material-ui/core";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/pipeable";
import * as React from "react";

export interface Actor extends io.Actor.Actor {
  selected: boolean;
}

export type AvatarScale = "scale1600" | "scale1000";

export const ActorListItem: React.FC<
  ListItemProps<Actor> & { avatarScale: AvatarScale }
> = ({ item, avatarScale, onClick }) => {
  return (
    <div
      key={item.id}
      style={{ display: "inline-block", margin: 5, cursor: "pointer" }}
      onClick={() => onClick?.(item)}
    >
      {pipe(
        O.fromNullable(item.avatar),
        O.map((src) => (
          <Avatar
            key={item.id}
            src={src}
          />
        )),
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
  avatarScale: AvatarScale;
}

export const ActorList: React.FC<ActorListProps> = ({
  actors,
  onActorClick,
  avatarScale,
}) => {
  return (
    <List
      data={actors}
      getKey={(a) => a.id}
      filter={(a) => true}
      onItemClick={onActorClick}
      ListItem={(p) => <ActorListItem avatarScale={avatarScale} {...p} />}
    />
  );
};
