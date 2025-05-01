import { EVENT_TYPES } from "@liexp/shared/lib/io/http/Events/EventType.js";
import {
  type Actor,
  type Events,
  type Group,
  type GroupMember,
  type Keyword,
} from "@liexp/shared/lib/io/http/index.js";
import * as React from "react";
import { BookListItem } from "./BookListItem.js";
import { DeathListItem } from "./DeathListItem.js";
import { DocumentaryListItem } from "./DocumentaryListItem.js";
import PatentListItem from "./PatentListItem.js";
import { QuoteListItem } from "./QuoteListItem.js";
import { ScientificStudyListItem } from "./ScientificStudyListItem.js";
import { TransactionListItem } from "./TransactionListItem.js";
import { UncategorizedListItem } from "./UncategorizedListItem.js";

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
    case EVENT_TYPES.BOOK: {
      return <BookListItem item={e} {...props} />;
    }
    case EVENT_TYPES.TRANSACTION: {
      return <TransactionListItem item={e} {...props} />;
    }
    case EVENT_TYPES.DOCUMENTARY: {
      return <DocumentaryListItem item={e} {...props} />;
    }
    case EVENT_TYPES.DEATH: {
      return <DeathListItem item={e} {...props} />;
    }
    case EVENT_TYPES.SCIENTIFIC_STUDY: {
      return <ScientificStudyListItem item={e} {...props} />;
    }
    case EVENT_TYPES.PATENT: {
      return <PatentListItem item={e} {...props} />;
    }
    case EVENT_TYPES.QUOTE: {
      return <QuoteListItem {...props} item={e} />;
    }
    default:
      return <UncategorizedListItem item={e} {...props} />;
  }
};
