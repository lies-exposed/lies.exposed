import type * as Actor from "../Actor";
import type * as Group from "../Group";
import type * as GroupMember from "../GroupMember";
import type * as Keyword from "../Keyword";
import type * as Media from "../Media";
import type * as Death from "./Death";
import type * as Documentary from "./Documentary";
import type * as Patent from "./Patent";
import type * as Quote from "./Quote";
import type * as ScientificStudy from "./ScientificStudy";
import type * as Transaction from "./Transaction";
import type * as Uncategorized from "./Uncategorized";

export interface SearchUncategorizedEvent
  extends Omit<Uncategorized.Uncategorized, "payload" | "media" | "keywords"> {
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
}

export interface SearchDeathEvent
  extends Omit<Death.Death, "payload" | "media" | "keywords"> {
  payload: Omit<Death.Death["payload"], "victim"> & {
    victim: Actor.Actor;
  };
  media: Media.Media[];
  keywords: Keyword.Keyword[];
}

export interface SearchScientificStudyEvent
  extends Omit<
    ScientificStudy.ScientificStudy,
    "payload" | "media" | "keywords"
  > {
  payload: Omit<
    ScientificStudy.ScientificStudy["payload"],
    "authors" | "publisher"
  > & {
    authors: Actor.Actor[];
    publisher: Group.Group;
  };
  media: Media.Media[];
  keywords: Keyword.Keyword[];
}

export interface SearchPatentEvent
  extends Omit<Patent.Patent, "payload" | "media" | "keywords"> {
  payload: Omit<Patent.Patent["payload"], "owners"> & {
    owners: {
      actors: Actor.Actor[];
      groups: Group.Group[];
    };
  };
  media: Media.Media[];
  keywords: Keyword.Keyword[];
}

export interface SearchDocumentaryEvent
  extends Omit<Documentary.Documentary, "payload" | "media" | "keywords"> {
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
  };
  media: Media.Media[];
  keywords: Keyword.Keyword[];
}

export interface SearchQuoteEvent
  extends Omit<Quote.Quote, "payload" | "media" | "keywords"> {
  payload: Omit<Quote.QuotePayload, "actor"> & {
    actor: Actor.Actor;
  };
  media: Media.Media[];
  keywords: Keyword.Keyword[];
}

export interface SearchTransactionEvent
  extends Omit<Transaction.Transaction, "payload" | "media" | "keywords"> {
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
}

export type SearchEvent =
  | SearchDeathEvent
  | SearchScientificStudyEvent
  | SearchUncategorizedEvent
  | SearchPatentEvent
  | SearchDocumentaryEvent
  | SearchTransactionEvent
  | SearchQuoteEvent;
