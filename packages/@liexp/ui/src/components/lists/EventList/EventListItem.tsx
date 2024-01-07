import {
  type Actor,
  Events,
  type Group,
  type GroupMember,
  type Keyword,
} from "@liexp/shared/lib/io/http";
import * as React from "react";
import { BookListItem } from "./BookListItem";
import { DeathListItem } from "./DeathListItem";
import { DocumentaryListItem } from "./DocumentaryListItem";
import PatentListItem from "./PatentListItem";
import { QuoteListItem } from "./QuoteListItem";
import { ScientificStudyListItem } from "./ScientificStudyListItem";
import { TransactionListItem } from "./TransactionListItem";
import { UncategorizedListItem } from "./UncategorizedListItem";

export interface EventListItemProps {
  className?: string;
  event: Events.SearchEvent.SearchEvent;
  style?: React.CSSProperties;
  condensed?: boolean;
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
  ...props
}) => {
  switch (e.type) {
    case Events.EventTypes.BOOK.value: {
      return <BookListItem item={e} {...props} />;
    }
    case Events.EventTypes.TRANSACTION.value: {
      return <TransactionListItem item={e} {...props} />;
    }
    case Events.EventTypes.DOCUMENTARY.value: {
      return <DocumentaryListItem item={e} {...props} />;
    }
    case Events.EventTypes.DEATH.value: {
      return <DeathListItem item={e} {...props} />;
    }
    case Events.EventTypes.SCIENTIFIC_STUDY.value: {
      return <ScientificStudyListItem item={e} {...props} />;
    }
    case Events.EventTypes.PATENT.value: {
      return <PatentListItem item={e} {...props} />;
    }
    case Events.EventTypes.QUOTE.value: {
      return <QuoteListItem {...props} item={e} />;
    }
    default:
      return <UncategorizedListItem item={e} {...props} />;
  }
};
