import {
  Actor,
  Events,
  Group,
  GroupMember,
  Keyword,
  Media
} from "@liexp/shared/io/http";
import * as React from "react";
import { DeathListItem } from "./DeathListItem";
import PatentListItem from "./PatentListItem";
import { ScientificStudyListItem } from "./ScientificStudyListItem";
import { UncategorizedListItem } from "./UncategorizedListItem";

export interface SearchUncategorizedEvent
  extends Omit<
    Events.Uncategorized.Uncategorized,
    "payload" | "media" | "keywords"
  > {
  payload: Omit<
    Events.Uncategorized.Uncategorized["payload"],
    "actors" | "groups" | "groupsMembers"
  > & {
    actors: Actor.Actor[];
    groups: Group.Group[];
    groupsMembers: GroupMember.GroupMember[];
  };
  media: Media.Media[];
  keywords: Keyword.Keyword[];
}

export interface SearchDeathEvent
  extends Omit<Events.Death.Death, "payload" | "media" | "keywords"> {
  payload: Omit<Events.Death.Death["payload"], "victim"> & {
    victim: Actor.Actor;
  };
  media: Media.Media[];
  keywords: Keyword.Keyword[];
}

export interface SearchScientificStudyEvent
  extends Omit<
    Events.ScientificStudy.ScientificStudy,
    "payload" | "media" | "keywords"
  > {
  payload: Omit<
    Events.ScientificStudy.ScientificStudy["payload"],
    "authors" | "publisher"
  > & {
    authors: Actor.Actor[];
    publisher: Group.Group;
  };
  media: Media.Media[];
  keywords: Keyword.Keyword[];
}

export interface SearchPatentEvent
  extends Omit<Events.Patent.Patent, "payload" | "media" | "keywords"> {
  payload: Omit<Events.Patent.Patent["payload"], "owners"> & {
    owners: {
      actors: Actor.Actor[];
      groups: Group.Group[];
    };
  };
  media: Media.Media[];
  keywords: Keyword.Keyword[];
}

export type SearchEvent =
  | SearchDeathEvent
  | SearchScientificStudyEvent
  | SearchUncategorizedEvent
  | SearchPatentEvent;

export interface EventListItemProps {
  event: SearchEvent;
  style?: React.CSSProperties;
  onClick: (e: any) => void;
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
    case Events.Death.DEATH.value: {
      return <DeathListItem item={e} {...props} />;
    }
    case Events.ScientificStudy.ScientificStudyType.value: {
      return <ScientificStudyListItem item={e} {...props} />;
    }
    case Events.Patent.PATENT.value: {
      return <PatentListItem item={e} {...props} />;
    }
    default:
      return <UncategorizedListItem item={e} {...props} />;
  }
};
