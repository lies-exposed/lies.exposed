import {
  Actor,
  Events,
  Group,
  GroupMember,
  Keyword
} from "@liexp/shared/io/http";
import * as React from "react";
import { DeathListItem } from "./DeathListItem";
import { DocumentaryListItem } from "./DocumentaryListItem";
import PatentListItem from "./PatentListItem";
import { ScientificStudyListItem } from "./ScientificStudyListItem";
import { TransactionListItem } from "./TransactionListItem";
import { UncategorizedListItem } from "./UncategorizedListItem";

export interface EventListItemProps {
  event: Events.SearchEvent.SearchEvent;
  style?: React.CSSProperties;
  onClick: (e: any) => void;
  onActorClick: (a: Actor.Actor) => void;
  onGroupClick: (g: Group.Group) => void;
  onGroupMemberClick: (gm: GroupMember.GroupMember) => void;
  onKeywordClick: (k: Keyword.Keyword) => void;
  onRowInvalidate: (e: Events.SearchEvent.SearchEvent) => void;
  onLoad?: () => void;
}

export const EventListItem: React.FC<EventListItemProps> = ({
  event: e,
  onLoad,
  ...props
}) => {
  switch (e.type) {
    case Events.Transaction.TRANSACTION.value: {
      return <TransactionListItem item={e} {...props} />;
    }
    case Events.Documentary.DOCUMENTARY.value: {
      return <DocumentaryListItem item={e} {...props} />;
    }
    case Events.Death.DEATH.value: {
      return <DeathListItem item={e} {...props} />;
    }
    case Events.ScientificStudy.SCIENTIFIC_STUDY.value: {
      return <ScientificStudyListItem item={e} {...props} />;
    }
    case Events.Patent.PATENT.value: {
      return <PatentListItem item={e} {...props} />;
    }
    default:
      return <UncategorizedListItem item={e} {...props} />;
  }
};
