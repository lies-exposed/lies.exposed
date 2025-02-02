import * as t from "io-ts";
import { type Actor } from "../Actor.js";
import { type Area } from "../Area.js";
import { URL, type UUID } from "../Common/index.js";
import { type Group } from "../Group.js";
import { type GroupMember } from "../GroupMember.js";
import { type Keyword } from "../Keyword.js";
import { type Link } from "../Link.js";
import { type Media } from "../Media/Media.js";
import * as Arrest from "./Arrest.js";
import * as Book from "./Book.js";
import * as Death from "./Death.js";
import * as Documentary from "./Documentary.js";
import { EventType, EventTypes } from "./EventType.js";
import * as Fined from "./Fined.js";
import * as Patent from "./Patent.js";
import * as Protest from "./Protest.js";
import * as PublicAnnouncement from "./PublicAnnouncement.js";
import * as Quote from "./Quote.js";
import * as ScientificStudy from "./ScientificStudy.js";
import * as SearchEvent from "./SearchEvents/SearchEvent.js";
import * as Transaction from "./Transaction.js";
import * as Uncategorized from "./Uncategorized.js";

export interface EventListMap {
  Protest: Protest.Protest[];
  Book: Book.Book[];
  Arrest: Arrest.Arrest[];
  Death: Death.Death[];
  PublicAnnouncement: PublicAnnouncement.PublicAnnouncement[];
  Uncategorized: Uncategorized.Uncategorized[];
  Transaction: Transaction.Transaction[];
}

export const EventMap: { [key in Event["type"]]: t.Mixed } = {
  Book: Book.Book,
  Death: Death.Death,
  Patent: Patent.Patent,
  ScientificStudy: ScientificStudy.ScientificStudy,
  Uncategorized: Uncategorized.Uncategorized,
  Documentary: Documentary.Documentary,
  Transaction: Transaction.Transaction,
  Quote: Quote.Quote,
};

export const EventFromURLBody = t.strict(
  {
    url: URL,
    type: EventType,
  },
  "EventFromURLBody",
);

export type EventFromURLBody = t.TypeOf<typeof EventFromURLBody>;

export const CreateEventPlainBody = t.union(
  [
    Book.CreateBookBody,
    Death.CreateDeathBody,
    Patent.CreatePatentBody,
    ScientificStudy.CreateScientificStudyBody,
    Uncategorized.CreateEventBody,
    Documentary.CreateDocumentaryBody,
    Transaction.CreateTransactionBody,
    Quote.CreateQuoteBody,
  ],
  "CreateEventPlainBody",
);
export type CreateEventPlainBody = t.TypeOf<typeof CreateEventPlainBody>;

export const CreateEventBody = t.union(
  [EventFromURLBody, CreateEventPlainBody],
  "CreateEventBody",
);

export type CreateEventBody = t.TypeOf<typeof CreateEventBody>;

export const EditEventBody = t.union(
  [
    Book.EditBookBody,
    Death.EditDeathBody,
    Patent.EditPatentBody,
    ScientificStudy.EditScientificStudyBody,
    Uncategorized.EditEventBody,
    Documentary.EditDocumentaryBody,
    Transaction.EditTransactionBody,
    Quote.EditQuoteBody,
  ],
  "EditEventBody",
);

export type EditEventBody = t.TypeOf<typeof EditEventBody>;

export const EventPayload = t.union(
  [
    Book.BookPayload,
    Death.DeathPayload,
    Patent.PatentPayload,
    ScientificStudy.ScientificStudyPayload,
    Uncategorized.UncategorizedV2Payload,
    Documentary.DocumentaryPayload,
    Transaction.TransactionPayload,
  ],
  "EventPayload",
);

export type EventPayload = t.TypeOf<typeof EventPayload>;

export const Event = t.union(
  [
    Book.Book,
    Death.Death,
    ScientificStudy.ScientificStudy,
    Uncategorized.Uncategorized,
    Patent.Patent,
    Documentary.Documentary,
    Transaction.Transaction,
    Quote.Quote,
  ],
  "EventV2",
);

export type Event = t.TypeOf<typeof Event>;

const EVENTS = t.literal("events");
type EVENTS = t.TypeOf<typeof EVENTS>;

interface EventRelationIds {
  actors: UUID[];
  areas: UUID[];
  groups: UUID[];
  groupsMembers: UUID[];
  keywords: UUID[];
  media: UUID[];
  links: UUID[];
}

interface EventRelations {
  actors: Actor[];
  groups: Group[];
  groupsMembers: GroupMember[];
  keywords: Keyword[];
  media: Media[];
  links: Link[];
  areas: Area[];
}

export {
  EventType,
  EventTypes,
  Protest,
  Fined,
  Book,
  Arrest,
  PublicAnnouncement,
  Death,
  ScientificStudy,
  Uncategorized,
  Patent,
  Documentary,
  Transaction,
  Quote,
  SearchEvent,
  EVENTS,
  type EventRelationIds,
  type EventRelations,
};
