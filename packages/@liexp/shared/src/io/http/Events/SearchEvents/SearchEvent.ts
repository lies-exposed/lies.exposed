import type * as Actor from "../../Actor.js";
import { type BySubject } from "../../Common/index.js";
import type * as Group from "../../Group.js";
import type * as GroupMember from "../../GroupMember.js";
import type * as Keyword from "../../Keyword.js";
import type * as Link from "../../Link.js";
import type * as Media from "../../Media.js";
import type * as Death from "../Death.js";
import type * as Documentary from "../Documentary.js";
import * as EventTotals from "../EventTotals.js";
import type * as Patent from "../Patent.js";
import type * as Quote from "../Quote.js";
import type * as ScientificStudy from "../ScientificStudy.js";
import type * as Transaction from "../Transaction.js";
import type * as Uncategorized from "../Uncategorized.js";
import type { SearchBookEvent } from "./SearchBookEvent.js";
import * as SearchEventsQuery from "./SearchEventsQuery.js";

export interface SearchUncategorizedEvent
  extends Omit<
    Uncategorized.Uncategorized,
    "payload" | "media" | "keywords" | "links"
  > {
  payload: Omit<
    Uncategorized.Uncategorized["payload"],
    "actors" | "groups" | "groupsMembers"
  > & {
    actors: Actor.Actor[];
    groups: Group.Group[];
    groupsMembers: GroupMember.GroupMember[];
  };
  media: Media.Media[];
  keywords: Keyword.Keyword[];
  links: Link.Link[];
}

export interface SearchDeathEvent
  extends Omit<Death.Death, "payload" | "media" | "keywords" | "links"> {
  payload: Omit<Death.Death["payload"], "victim"> & {
    victim: Actor.Actor;
  };
  media: Media.Media[];
  keywords: Keyword.Keyword[];
  links: Link.Link[];
}

export interface SearchScientificStudyEvent
  extends Omit<
    ScientificStudy.ScientificStudy,
    "payload" | "media" | "keywords" | "links"
  > {
  payload: Omit<
    ScientificStudy.ScientificStudy["payload"],
    "authors" | "publisher" | "url"
  > & {
    url: Link.Link;
    authors: Actor.Actor[];
    publisher?: Group.Group;
  };
  media: Media.Media[];
  keywords: Keyword.Keyword[];
  links: Link.Link[];
}

export interface SearchPatentEvent
  extends Omit<Patent.Patent, "payload" | "media" | "keywords" | "links"> {
  payload: Omit<Patent.Patent["payload"], "source" | "owners"> & {
    source: Link.Link;
    owners: {
      actors: Actor.Actor[];
      groups: Group.Group[];
    };
  };
  media: Media.Media[];
  keywords: Keyword.Keyword[];
  links: Link.Link[];
}

export interface SearchDocumentaryEvent
  extends Omit<
    Documentary.Documentary,
    "payload" | "media" | "keywords" | "links"
  > {
  payload: Omit<
    Documentary.DocumentaryPayload,
    "media" | "authors" | "subjects"
  > & {
    media: Media.Media;
    authors: {
      actors: Actor.Actor[];
      groups: Group.Group[];
    };
    subjects: {
      actors: Actor.Actor[];
      groups: Group.Group[];
    };
    website: Link.Link;
  };
  media: Media.Media[];
  keywords: Keyword.Keyword[];
  links: Link.Link[];
}

export interface SearchQuoteEvent
  extends Omit<Quote.Quote, "payload" | "media" | "keywords" | "links"> {
  payload: Omit<Quote.QuotePayload, "subject"> & {
    subject: BySubject;
  };
  media: Media.Media[];
  keywords: Keyword.Keyword[];
  links: Link.Link[];
}

export interface SearchTransactionEvent
  extends SearchEventBase<Transaction.Transaction> {
  payload: Omit<Transaction.TransactionPayload, "from" | "to"> & {
    from: BySubject;
    to: BySubject;
  };
}

type SearchEventBase<T extends { payload: any }> = Omit<
  T,
  "payload" | "media" | "keywords" | "links"
> & {
  media: Media.Media[];
  keywords: Keyword.Keyword[];
  links: Link.Link[];
};

type SearchEvent =
  | SearchBookEvent
  | SearchDeathEvent
  | SearchScientificStudyEvent
  | SearchUncategorizedEvent
  | SearchPatentEvent
  | SearchDocumentaryEvent
  | SearchTransactionEvent
  | SearchQuoteEvent;

export {
  SearchEventsQuery,
  type SearchEvent,
  EventTotals,
  type SearchBookEvent,
};
