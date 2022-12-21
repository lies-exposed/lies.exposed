import * as t from "io-ts";
import * as Arrest from "./Arrest";
import * as Condemned from "./Condemned";
import * as Death from "./Death";
import * as Documentary from "./Documentary";
import * as Fined from "./Fined";
import * as Patent from "./Patent";
import * as Protest from "./Protest";
import * as PublicAnnouncement from "./PublicAnnouncement";
import * as Quote from "./Quote";
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
  Quote: Quote.Quote,
};

export const CreateEventBody = t.union(
  [
    Death.CreateDeathBody,
    Patent.CreatePatentBody,
    ScientificStudy.CreateScientificStudyBody.types[0],
    Uncategorized.CreateEventBody,
    Documentary.CreateDocumentaryBody,
    Transaction.CreateTransactionBody,
    Quote.CreateQuoteBody
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
    Quote.EditQuoteBody
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
    Quote.QUOTE,
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
    Quote.Quote
  ],
  "EventV2"
);

export type Event = t.TypeOf<typeof Event>;

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
  Quote,
  SearchEvent,
};
