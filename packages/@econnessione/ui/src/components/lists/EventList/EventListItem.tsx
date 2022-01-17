import {
  Actor,
  Events,
  Group,
  GroupMember,
  Keyword,
  Link,
  Media,
} from "@econnessione/shared/io/http";
import * as React from "react";
import { DeathListItem } from "./DeathListItem";
import { ScientificStudyListItem } from "./ScientificStudyListItem";
import { UncategorizedListItem } from "./UncategorizedListItem";

export interface EventListItemProps {
  event: Events.Event;
  actors: Actor.Actor[];
  groups: Group.Group[];
  groupsMembers: GroupMember.GroupMember[];
  keywords: Keyword.Keyword[];
  media: Media.Media[];
  links: Link.Link[];
  onClick: (e: Events.Event) => void;
  onActorClick: (a: Actor.Actor) => void;
  onGroupClick: (g: Group.Group) => void;
  onGroupMemberClick: (gm: GroupMember.GroupMember) => void;
  onKeywordClick: (k: Keyword.Keyword) => void;
}

export const EventListItem: React.FC<EventListItemProps> = ({
  event: e,
  ...props
}) => {
  switch (e.type) {
    case Events.Death.DeathType.value: {
      const victim = props.actors.find((a) => a.id === e.payload.victim);
      return <DeathListItem item={e} {...props} victim={victim as any} />;
    }
    case Events.ScientificStudy.ScientificStudyType.value: {
      return <ScientificStudyListItem item={e} {...props} />;
    }
    default:
      return <UncategorizedListItem item={e} {...props} />;
  }
};
