import * as t from "io-ts";
import { type Actor } from "../Actor";
import { type Area } from "../Area";
import { type UUID } from "../Common";
import { type Group } from "../Group";
import { type GroupMember } from "../GroupMember";
import { type Keyword } from "../Keyword";
import { type Link } from "../Link";
import { type Media } from "../Media";
import * as Arrest from "./Arrest";
import * as Book from "./Book";
import * as Death from "./Death";
import * as Documentary from "./Documentary";
import { EventType, EventTypes } from "./EventType";
import * as Fined from "./Fined";
import * as Patent from "./Patent";
import * as Protest from "./Protest";
import * as PublicAnnouncement from "./PublicAnnouncement";
import * as Quote from "./Quote";
import * as ScientificStudy from "./ScientificStudy";
import * as SearchEvent from "./SearchEvents/SearchEvent";
import * as Transaction from "./Transaction";
import * as Uncategorized from "./Uncategorized";

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

export const CreateEventBody = t.union(
  [
    Book.CreateBookBody,
    Death.CreateDeathBody,
    Patent.CreatePatentBody,
    ScientificStudy.CreateScientificStudyBody.types[0],
    Uncategorized.CreateEventBody,
    Documentary.CreateDocumentaryBody,
    Transaction.CreateTransactionBody,
    Quote.CreateQuoteBody,
  ],
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
