import {
  Actor,
  Group,
  Keyword,
  Events,
  GroupMember,
} from "@econnessione/shared/io/http";
import * as React from "react";
import { DeathListItem } from "./DeathListItem";
import { ScientificStudyListItem } from "./ScientificStudyListItem";
import { UncategorizedListItem } from "./UncategorizedListItem";

interface EventListItemProps {
  event: Events.Event;
  actors: Actor.Actor[];
  groups: Group.Group[];
  groupsMembers: GroupMember.GroupMember[];
  keywords: Keyword.Keyword[];
  onClick?: (e: Events.Event) => void;
}

export const EventListItem: React.FC<EventListItemProps> = ({
  event: e,
  onClick,
  ...props
}) => {
  switch (e.type) {
    case Events.Death.DeathType.value: {
      return (
        <DeathListItem
          item={e}
          actors={props.actors}
          keywords={props.keywords}
          links={[]}
        />
      );
    }
    case Events.ScientificStudy.ScientificStudyType.value: {
      return (
        <ScientificStudyListItem
          item={e}
          actors={props.actors}
          keywords={props.keywords}
          groups={props.groups}
          links={[]}
        />
      );
    }
    default:
      return (
        <UncategorizedListItem
          item={e}
          actors={props.actors}
          groups={props.groups}
          keywords={props.keywords}
          groupsMembers={props.groupsMembers}
          links={e.links}
          onClick={onClick}
        />
      );
  }
};
