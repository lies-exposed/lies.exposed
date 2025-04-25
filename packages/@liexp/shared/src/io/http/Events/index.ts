import { Schema } from "effect";
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

export const EventMap = {
  Book: Book.Book,
  Death: Death.Death,
  Patent: Patent.Patent,
  ScientificStudy: ScientificStudy.ScientificStudy,
  Uncategorized: Uncategorized.Uncategorized,
  Documentary: Documentary.Documentary,
  Transaction: Transaction.Transaction,
  Quote: Quote.Quote,
};
export type EventMap = typeof EventMap;

export const EventPayload = Schema.Union(
  Book.BookPayload,
  Death.DeathPayload,
  Patent.PatentPayload,
  ScientificStudy.ScientificStudyPayload,
  Uncategorized.UncategorizedV2Payload,
  Documentary.DocumentaryPayload,
  Transaction.TransactionPayload,
  Quote.QuotePayload,
).annotations({
  title: "EventPayload",
});

export type EventPayload = typeof EventPayload.Type;

export const EventFromURLBody = Schema.Struct({
  url: URL,
  type: EventType,
  date: Schema.Union(Schema.Date, Schema.Undefined),
}).annotations({
  title: "EventFromURLBody",
});

export type EventFromURLBody = typeof EventFromURLBody.Type;

export const CreateEventPlainBody = Schema.Union(
  Book.CreateBookBody,
  Death.CreateDeathBody,
  Patent.CreatePatentBody,
  ScientificStudy.CreateScientificStudyBody,
  Uncategorized.CreateEventBody,
  Documentary.CreateDocumentaryBody,
  Transaction.CreateTransactionBody,
  Quote.CreateQuoteBody,
).annotations({
  title: "CreateEventPlainBody",
});
export type CreateEventPlainBody = typeof CreateEventPlainBody.Type;

export const CreateEventBody = Schema.Union(
  EventFromURLBody,
  ...CreateEventPlainBody.members,
).annotations({
  title: "CreateEventBody",
});

export type CreateEventBody = typeof CreateEventBody.Type;

export const EditEventBody = Schema.Union(
  Book.EditBookBody,
  Death.EditDeathBody,
  Patent.EditPatentBody,
  ScientificStudy.EditScientificStudyBody,
  Uncategorized.EditEventBody,
  Documentary.EditDocumentaryBody,
  Transaction.EditTransactionBody,
  Quote.EditQuoteBody,
).annotations({
  title: "EditEventBody",
});

export type EditEventBody = typeof EditEventBody.Type;

export const Event = Schema.Union(
  Book.Book,
  Death.Death,
  ScientificStudy.ScientificStudy,
  Uncategorized.Uncategorized,
  Patent.Patent,
  Documentary.Documentary,
  Transaction.Transaction,
  Quote.Quote,
).annotations({
  title: "EventV2",
});

export type Event = typeof Event.Type;

const EVENTS = Schema.Literal("events");
type EVENTS = typeof EVENTS.Type;

interface EventRelationIds {
  actors: readonly UUID[];
  areas: readonly UUID[];
  groups: readonly UUID[];
  groupsMembers: readonly UUID[];
  keywords: readonly UUID[];
  media: readonly UUID[];
  links: readonly UUID[];
}

interface EventRelations {
  actors: readonly Actor[];
  groups: readonly Group[];
  groupsMembers: readonly GroupMember[];
  keywords: readonly Keyword[];
  media: readonly Media[];
  links: readonly Link[];
  areas: readonly Area[];
}

export {
  Arrest,
  Book,
  Death,
  Documentary,
  EVENTS,
  EventType,
  EventTypes,
  Fined,
  Patent,
  Protest,
  PublicAnnouncement,
  Quote,
  ScientificStudy,
  SearchEvent,
  Transaction,
  Uncategorized,
  type EventRelationIds,
  type EventRelations,
};
