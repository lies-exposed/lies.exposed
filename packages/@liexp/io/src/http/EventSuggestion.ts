import { Schema } from "effect";
import { URL, UUID } from "./Common/index.js";
import {
  Book,
  Death,
  Documentary,
  Event,
  Patent,
  Quote,
  ScientificStudy,
  Uncategorized,
} from "./Events/index.js";

const EventSuggestionNewType = Schema.Literal("New");
const EventSuggestionUpdateType = Schema.Literal("Update");

export const EventSuggestionType = Schema.Union(
  EventSuggestionNewType,
  EventSuggestionUpdateType,
).annotations({
  title: "EventSuggestionType",
});
export type EventSuggestionType = typeof EventSuggestionType.Type;

const PendingStatus = Schema.Literal("PENDING");
const CompletedStatus = Schema.Literal("COMPLETED");
const DiscardedStatus = Schema.Literal("DISCARDED");

export const EventSuggestionStatus = Schema.Union(
  PendingStatus,
  CompletedStatus,
  DiscardedStatus,
).annotations({
  title: "EventSuggestionStatus",
});
export type EventSuggestionStatus = typeof EventSuggestionStatus.Type;

const EventSuggestionLinks = Schema.Array(
  Schema.Union(
    UUID,
    Schema.Struct({
      fromURL: Schema.Boolean,
      url: URL,
      publishDate: Schema.Union(Schema.Date, Schema.Null).annotations({
        title: "PublishDate?",
      }),
    }),
  ),
).annotations({ title: "EventSuggestionLinks" });

const UpdateEventSuggestion = Schema.Struct({
  type: EventSuggestionUpdateType,
  eventId: UUID,
  event: Schema.extend(
    Schema.Struct({ newLinks: EventSuggestionLinks }),
    Event,
  ),
}).annotations({
  title: "UpdateEventSuggestion",
});

const NewBookEvent = Schema.Struct({
  ...Book.Book.omit("id", "createdAt", "updatedAt").fields,
  newLinks: EventSuggestionLinks,
}).annotations({
  title: "NewBookEvent",
});

const NewDeathEvent = Schema.Struct({
  ...Death.Death.omit("id", "createdAt", "updatedAt").fields,
  newLinks: EventSuggestionLinks,
}).annotations({
  title: "NewDeathEvent",
});
const NewScientificStudyEvent = Schema.Struct({
  ...ScientificStudy.ScientificStudy.omit("id", "createdAt", "updatedAt")
    .fields,
  newLinks: EventSuggestionLinks,
}).annotations({
  title: "NewScientificStudyEvent",
});
const NewPatentEvent = Schema.Struct({
  ...Patent.Patent.omit("id", "createdAt", "updatedAt").fields,
  newLinks: EventSuggestionLinks,
}).annotations({
  title: "NewPatentEvent",
});
const NewDocumentaryEvent = Schema.Struct({
  ...Documentary.Documentary.omit("id", "createdAt", "updatedAt").fields,
  newLinks: EventSuggestionLinks,
}).annotations({
  title: "NewDocumentaryEvent",
});
const NewQuoteEvent = Schema.Struct({
  ...Quote.Quote.omit("id", "createdAt", "updatedAt").fields,
  newLinks: EventSuggestionLinks,
}).annotations({
  title: "NewQuoteEvent",
});

const NewUncategorizedEvent = Schema.Struct({
  ...Uncategorized.Uncategorized.omit("id", "createdAt", "updatedAt").fields,
  newLinks: EventSuggestionLinks,
}).annotations({
  title: "NewUncategorizedEvent",
});

export const NewEventSuggestion = Schema.Struct({
  type: EventSuggestionNewType,
  event: Schema.Union(
    NewBookEvent,
    NewDeathEvent,
    NewScientificStudyEvent,
    NewPatentEvent,
    NewUncategorizedEvent,
    NewDocumentaryEvent,
    NewQuoteEvent,
  ).annotations({
    title: "Event",
  }),
}).annotations({
  title: "NewEventSuggestion",
});
export type NewEventSuggestion = typeof NewEventSuggestion.Type;

export const CreateEventSuggestion = Schema.Union(
  UpdateEventSuggestion,
  NewEventSuggestion,
).annotations({
  title: "EventSuggestion",
});
export type CreateEventSuggestion = typeof CreateEventSuggestion.Type;

export const EventSuggestion = Schema.Struct({
  id: UUID,
  payload: CreateEventSuggestion,
  creator: Schema.Union(UUID, Schema.Undefined),
  createdAt: Schema.Date,
  updatedAt: Schema.Date,
}).annotations({
  title: "EventSuggestion",
});

export type EventSuggestion = typeof EventSuggestion.Type;
