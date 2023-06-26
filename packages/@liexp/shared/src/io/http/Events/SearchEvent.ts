import type * as Actor from "../Actor";
import type * as Group from "../Group";
import type * as GroupMember from "../GroupMember";
import type * as Keyword from "../Keyword";
import type * as Link from '../Link';
import type * as Media from "../Media";
import type * as Death from "./Death";
import type * as Documentary from "./Documentary";
import type * as Patent from "./Patent";
import type * as Quote from "./Quote";
import type * as ScientificStudy from "./ScientificStudy";
import * as SearchEventsQuery from "./SearchEventsQuery";
import type * as Transaction from "./Transaction";
import type * as Uncategorized from "./Uncategorized";


export interface SearchUncategorizedEvent
  extends Omit<Uncategorized.Uncategorized, "payload" | "media" | "keywords"| 'links'> {
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
  extends Omit<Death.Death, "payload" | "media" | "keywords" | 'links'> {
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
    "payload" | "media" | "keywords" | 'links'
  > {
  payload: Omit<
    ScientificStudy.ScientificStudy["payload"],
    "authors" | "publisher" | 'url'
  > & {
    url: Link.Link
    authors: Actor.Actor[];
    publisher: Group.Group;
  };
  media: Media.Media[];
  keywords: Keyword.Keyword[];
  links: Link.Link[];
}

export interface SearchPatentEvent
  extends Omit<Patent.Patent, "payload" | "media" | "keywords" | 'links'> {
  payload: Omit<Patent.Patent["payload"], 'source' | "owners"> & {
    source: Link.Link
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
  extends Omit<Documentary.Documentary, "payload" | "media" | "keywords" | 'links'> {
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
    website: Link.Link
  };
  media: Media.Media[];
  keywords: Keyword.Keyword[];
  links: Link.Link[];
}

export interface SearchQuoteEvent
  extends Omit<Quote.Quote, "payload" | "media" | "keywords" | 'links'> {
  payload: Omit<Quote.QuotePayload, "actor"> & {
    actor: Actor.Actor;
  };
  media: Media.Media[];
  keywords: Keyword.Keyword[];
  links: Link.Link[];
}

export interface SearchTransactionEvent
  extends Omit<Transaction.Transaction, "payload" | "media" | "keywords" | 'links'> {
  payload: Omit<Transaction.TransactionPayload, "from" | "to"> & {
    from:
      | {
          type: "Group";
          id: Group.Group;
        }
      | {
          type: "Actor";
          id: Actor.Actor;
        };
    to:
      | {
          type: "Group";
          id: Group.Group;
        }
      | {
          type: "Actor";
          id: Actor.Actor;
        };
  };
  media: Media.Media[];
  keywords: Keyword.Keyword[];
  links: Link.Link[];
}



type SearchEvent =
  | SearchDeathEvent
  | SearchScientificStudyEvent
  | SearchUncategorizedEvent
  | SearchPatentEvent
  | SearchDocumentaryEvent
  | SearchTransactionEvent
  | SearchQuoteEvent;

export { SearchEventsQuery, type SearchEvent };
