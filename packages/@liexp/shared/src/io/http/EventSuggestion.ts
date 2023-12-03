import { propsOmit } from "@liexp/core/lib/io/utils";
import * as t from "io-ts";
import { DateFromISOString } from "io-ts-types/lib/DateFromISOString";
import { UUID } from "io-ts-types/lib/UUID";
import { URL } from "./Common";
import {
  Book,
  Death,
  Documentary,
  Event,
  Patent,
  Quote,
  ScientificStudy,
  Uncategorized,
} from "./Events";

const EventSuggestionNewType = t.literal("New");
const EventSuggestionUpdateType = t.literal("Update");

export const EventSuggestionType = t.union(
  [EventSuggestionNewType, EventSuggestionUpdateType],
  "EventSuggestionType",
);
export type EventSuggestionType = t.TypeOf<typeof EventSuggestionType>;

const PendingStatus = t.literal("PENDING");
const CompletedStatus = t.literal("COMPLETED");
const DiscardedStatus = t.literal("DISCARDED");

export const EventSuggestionStatus = t.union(
  [PendingStatus, CompletedStatus, DiscardedStatus],
  "EventSuggestionStatus",
);
export type EventSuggestionStatus = t.TypeOf<typeof EventSuggestionStatus>;

const EventSuggestionLinks = t.array(
  t.union(
    [
      UUID,
      t.type({
        fromURL: t.boolean,
        url: URL,
        publishDate: t.union([DateFromISOString, t.null], "PublishDate?"),
      }),
    ],
    "EventSuggestionLinks",
  ),
);

const UpdateEventSuggestion = t.type(
  {
    type: EventSuggestionUpdateType,
    eventId: UUID,
    event: t.intersection(
      [Event, t.strict({ newLinks: EventSuggestionLinks })],
      "Event",
    ),
  },
  "UpdateEventSuggestion",
);

const NewBookEvent = t.strict(
  {
    ...propsOmit(Book.Book, ["id", "createdAt", "updatedAt"]),
    newLinks: EventSuggestionLinks,
  },
  "NewBookEvent",
);

const NewDeathEvent = t.strict(
  {
    ...propsOmit(Death.Death, ["id", "createdAt", "updatedAt"]),
    newLinks: EventSuggestionLinks,
  },
  "NewDeathEvent",
);
const NewScientificStudyEvent = t.strict(
  {
    ...propsOmit(ScientificStudy.ScientificStudy, [
      "id",
      "createdAt",
      "updatedAt",
    ]),
    newLinks: EventSuggestionLinks,
  },
  "NewScientificStudyEvent",
);
const NewPatentEvent = t.strict(
  {
    ...propsOmit(Patent.Patent, ["id", "createdAt", "updatedAt"]),
    newLinks: EventSuggestionLinks,
  },
  "NewPatentEvent",
);
const NewDocumentaryEvent = t.strict(
  {
    ...propsOmit(Documentary.Documentary, ["id", "createdAt", "updatedAt"]),
    newLinks: EventSuggestionLinks,
  },
  "NewDocumentaryEvent",
);
const NewQuoteEvent = t.strict(
  {
    ...propsOmit(Quote.Quote, ["id", "createdAt", "updatedAt"]),
    newLinks: EventSuggestionLinks,
  },
  "NewQuoteEvent",
);

const NewUncategorizedEvent = t.strict(
  {
    ...propsOmit(Uncategorized.Uncategorized, ["id", "createdAt", "updatedAt"]),
    newLinks: EventSuggestionLinks,
  },
  "NewUncategorizedEvent",
);

export const NewEventSuggestion = t.strict(
  {
    type: EventSuggestionNewType,
    event: t.union(
      [
        NewBookEvent,
        NewDeathEvent,
        NewScientificStudyEvent,
        NewPatentEvent,
        NewUncategorizedEvent,
        NewDocumentaryEvent,
        NewQuoteEvent,
      ],
      "Event",
    ),
  },
  "NewEventSuggestion",
);
export type NewEventSuggestion = t.TypeOf<typeof NewEventSuggestion>;

export const CreateEventSuggestion = t.union(
  [UpdateEventSuggestion, NewEventSuggestion],
  "EventSuggestion",
);
export type CreateEventSuggestion = t.TypeOf<typeof CreateEventSuggestion>;

export const EventSuggestion = t.intersection(
  [
    t.strict(
      {
        id: UUID,
        creator: t.union([UUID, t.undefined]),
        createdAt: DateFromISOString,
        updatedAt: DateFromISOString,
      },
      "EventSuggestionBase",
    ),
    CreateEventSuggestion,
  ],
  "EventSuggestion",
);

export type EventSuggestion = t.TypeOf<typeof EventSuggestion>;
