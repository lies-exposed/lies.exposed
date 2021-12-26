import {
  Actor,
  Group,
  Keyword,
  Events,
  GroupMember,
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
      return <DeathListItem item={e} {...props} links={[]} />;
    }
    case Events.ScientificStudy.ScientificStudyType.value: {
      return <ScientificStudyListItem item={e} links={[]} {...props} />;
    }
    default:
      return <UncategorizedListItem item={e} {...props} links={[]} />;
  }
};
