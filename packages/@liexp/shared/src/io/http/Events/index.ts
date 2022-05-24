import * as t from "io-ts";
import { DateFromISOString, UUID } from "io-ts-types";
import { propsOmit } from "../../utils";
import { URL } from "../Common";
import * as Arrest from "./Arrest";
import * as Condemned from "./Condemned";
import * as Death from "./Death";
import * as Documentary from "./Documentary";
import * as Fined from "./Fined";
import * as Patent from "./Patent";
import * as Protest from "./Protest";
import * as PublicAnnouncement from "./PublicAnnouncement";
import * as ScientificStudy from "./ScientificStudy";
import * as SearchEvent from "./SearchEvent";
import * as Transaction from "./Transaction";
import * as Uncategorized from "./Uncategorized";

export interface EventListMap {
  Protest: Protest.Protest[];
  Condemned: Condemned.Condemned[];
  Arrest: Arrest.Arrest[];
  Death: Death.Death[];
  PublicAnnouncement: PublicAnnouncement.PublicAnnouncement[];
  Uncategorized: Uncategorized.Uncategorized[];
  Transaction: Transaction.Transaction[];
}

export const EventMap: { [key in Event["type"]]: t.Mixed } = {
  Death: Death.Death,
  Patent: Patent.Patent,
  ScientificStudy: ScientificStudy.ScientificStudy,
  Uncategorized: Uncategorized.Uncategorized,
  Documentary: Documentary.Documentary,
  Transaction: Transaction.Transaction,
};

export const CreateEventBody = t.union(
  [
    Death.CreateDeathBody,
    Patent.CreatePatentBody,
    ScientificStudy.CreateScientificStudyBody,
    Uncategorized.CreateEventBody,
    Documentary.CreateDocumentaryBody,
    Transaction.CreateTransactionBody,
  ],
  "CreateEventBody"
);

export type CreateEventBody = t.TypeOf<typeof CreateEventBody>;

export const EditEventBody = t.union(
  [
    Death.EditDeathBody,
    Patent.EditPatentBody,
    ScientificStudy.EditScientificStudyBody,
    Uncategorized.EditEventBody,
    Documentary.EditDocumentaryBody,
    Transaction.EditTransactionBody,
  ],
  "EditEventBody"
);

export type EditEventBody = t.TypeOf<typeof EditEventBody>;

export const EventPayload = t.union(
  [
    Death.DeathPayload,
    Patent.PatentPayload,
    ScientificStudy.ScientificStudyPayload,
    Uncategorized.UncategorizedV2Payload,
    Documentary.DocumentaryPayload,
    Transaction.TransactionPayload,
  ],
  "EventPayload"
);

export type EventPayload = t.TypeOf<typeof EventPayload>;

export const EventType = t.union(
  [
    Death.DEATH,
    Uncategorized.UNCATEGORIZED,
    ScientificStudy.SCIENTIFIC_STUDY,
    Patent.PATENT,
    Documentary.DOCUMENTARY,
    Transaction.TRANSACTION,
  ],
  "EventType"
);
export type EventType = t.TypeOf<typeof EventType>;

export const Event = t.union(
  [
    Death.Death,
    ScientificStudy.ScientificStudy,
    Uncategorized.Uncategorized,
    Patent.Patent,
    Documentary.Documentary,
    Transaction.Transaction,
  ],
  "EventV2"
);

export type Event = t.TypeOf<typeof Event>;

const EventSuggestionNewType = t.literal("New");
const EventSuggestionUpdateType = t.literal("Update");

export const EventSuggestionType = t.union(
  [EventSuggestionNewType, EventSuggestionUpdateType],
  "EventSuggestionType"
);
export type EventSuggestionType = t.TypeOf<typeof EventSuggestionType>;

const PendingStatus = t.literal("PENDING");
const CompletedStatus = t.literal("COMPLETED");
const DiscardedStatus = t.literal("DISCARDED");

export const EventSuggestionStatus = t.union(
  [PendingStatus, CompletedStatus, DiscardedStatus],
  "EventSuggestionStatus"
);
export type EventSuggestionStatus = t.TypeOf<typeof EventSuggestionStatus>;

const UpdateEventSuggestion = t.type(
  {
    type: EventSuggestionUpdateType,
    eventId: UUID,
    event: Event,
  },
  "UpdateEventSuggestion"
);

const EventSuggestionLinks = t.array(
  t.union([
    UUID,
    t.type({
      url: URL,
      publishDate: DateFromISOString,
    }),
  ])
);

const NewDeathEvent = t.strict(
  {
    ...propsOmit(Death.Death, ["id", "links", "createdAt", "updatedAt"]),
    links: EventSuggestionLinks,
  },
  "NewDeathEvent"
);
const NewScientificStudyEvent = t.strict(
  {
    ...propsOmit(ScientificStudy.ScientificStudy, [
      "id",
      "links",
      "createdAt",
      "updatedAt",
    ]),
    links: EventSuggestionLinks,
  },
  "NewScientificStudyEvent"
);
const NewPatentEvent = t.strict(
  {
    ...propsOmit(Patent.Patent, ["id", "links", "createdAt", "updatedAt"]),
    links: EventSuggestionLinks,
  },
  "NewPatentEvent"
);
const NewDocumentaryEvent = t.strict(
  {
    ...propsOmit(Documentary.Documentary, [
      "id",
      "links",
      "createdAt",
      "updatedAt",
    ]),
    links: EventSuggestionLinks,
  },
  "NewDocumentaryEvent"
);

const NewUncategorizedEvent = t.strict(
  {
    ...propsOmit(Uncategorized.Uncategorized, [
      "id",
      "links",
      "createdAt",
      "updatedAt",
    ]),
    links: EventSuggestionLinks,
  },
  "NewUncategorizedEvent"
);

const NewEventSuggestion = t.strict({
  type: EventSuggestionNewType,
  event: t.union(
    [
      NewDeathEvent,
      NewScientificStudyEvent,
      NewPatentEvent,
      NewUncategorizedEvent,
      NewDocumentaryEvent,
    ],
    "Event"
  ),
});

export const EventSuggestion = t.union(
  [UpdateEventSuggestion, NewEventSuggestion],
  "EventSuggestion"
);

export type EventSuggestion = t.TypeOf<typeof EventSuggestion>;

export {
  Protest,
  Fined,
  Condemned,
  Arrest,
  PublicAnnouncement,
  Death,
  ScientificStudy,
  Uncategorized,
  Patent,
  Documentary,
  Transaction,
  SearchEvent,
};
