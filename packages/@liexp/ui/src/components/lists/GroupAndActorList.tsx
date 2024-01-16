import { type Actor, type Group } from "@liexp/shared/lib/io/http/index.js";
import * as React from "react";
import { type AvatarSize } from "../Common/Avatar.js";
import { List } from "../Common/List.js";
import { ActorListItem } from "./ActorList.js";
import { GroupListItem } from "./GroupList.js";

export interface Group extends Group.Group {
  selected: boolean;
}

type ByGroupOrActor =
  | {
      type: "Actor";
      actor: Actor.Actor;
    }
  | {
      type: "Group";
      group: Group.Group;
    };

interface ByEitherGroupOrActorListProps {
  by: ByGroupOrActor[];
  onByClick: (by: ByGroupOrActor) => void;
  avatarSize: AvatarSize;
}

const GroupOrActorList: React.FC<ByEitherGroupOrActorListProps> = ({
  onByClick,
  avatarSize,
  by,
}) => {
  return (
    <List<ByGroupOrActor>
      data={by}
      filter={(_) => true}
      onItemClick={onByClick}
      getKey={(g) => (g.type === "Group" ? g.group.id : g.actor.id)}
      ListItem={(p) => {
        const item = p.item;
        return item.type === "Group" ? (
          <GroupListItem
            {...p.item}
            key={`group-${item.group.id}`}
            index={p.index}
            avatarSize={avatarSize}
            item={{ ...item.group, selected: true }}
            onClick={(group, e) => {
              p.onClick?.({ type: "Group", group }, e);
            }}
          />
        ) : (
          <ActorListItem
            {...p.item}
            key={`actor-${item.actor.id}`}
            index={p.index}
            avatarSize={avatarSize}
            onClick={(a, e) => {
              p.onClick?.({ type: "Actor", actor: a }, e);
            }}
            item={{ ...item.actor, selected: true }}
          />
        );
      }}
    />
  );
};

export default GroupOrActorList;
