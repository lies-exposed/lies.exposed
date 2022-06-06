import * as t from 'io-ts';
import { DateFromISOString, UUID } from 'io-ts-types';
import { propsOmit } from '../utils';
import { URL } from './Common';
import { Death, Documentary, Event, Patent, ScientificStudy, Uncategorized } from './Events';

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

const EventSuggestionLinks = t.array(
  t.union([
    UUID,
    t.type({
      fromURL: t.boolean,
      url: URL,
      publishDate: t.union([DateFromISOString, t.null]),
    }),
  ])
);

const UpdateEventSuggestion = t.type(
  {
    type: EventSuggestionUpdateType,
    eventId: UUID,
    event: t.intersection([
      Event,
      t.strict({ newLinks: EventSuggestionLinks }),
    ]),
  },
  "UpdateEventSuggestion"
);

const NewDeathEvent = t.strict(
  {
    ...propsOmit(Death.Death, ["id", "createdAt", "updatedAt"]),
    newLinks: EventSuggestionLinks,
  },
  "NewDeathEvent"
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
  "NewScientificStudyEvent"
);
const NewPatentEvent = t.strict(
  {
    ...propsOmit(Patent.Patent, ["id", "createdAt", "updatedAt"]),
    newLinks: EventSuggestionLinks,
  },
  "NewPatentEvent"
);
const NewDocumentaryEvent = t.strict(
  {
    ...propsOmit(Documentary.Documentary, ["id", "createdAt", "updatedAt"]),
    newLinks: EventSuggestionLinks,
  },
  "NewDocumentaryEvent"
);

const NewUncategorizedEvent = t.strict(
  {
    ...propsOmit(Uncategorized.Uncategorized, ["id", "createdAt", "updatedAt"]),
    newLinks: EventSuggestionLinks,
  },
  "NewUncategorizedEvent"
);

export const NewEventSuggestion = t.strict({
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
export type NewEventSuggestion = t.TypeOf<typeof NewEventSuggestion>


export const EventSuggestion = t.union(
  [UpdateEventSuggestion, NewEventSuggestion],
  "EventSuggestion"
);

export type EventSuggestion = t.TypeOf<typeof EventSuggestion>;
