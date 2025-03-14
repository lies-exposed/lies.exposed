import { EventTypes } from "@liexp/shared/lib/io/http/Events/index.js";
import { type SearchEventsQueryInputNoPagination } from "../../../state/queries/SearchEventsQuery.js";
import { type EventTypeFiltersProps } from "./EventTypeFilters.js";

export const searchEventQueryToEventTypeFilters = (
  query: SearchEventsQueryInputNoPagination,
): Required<EventTypeFiltersProps["filters"]> => {
  return {
    [EventTypes.BOOK.Type]: !!query.eventType?.includes(EventTypes.BOOK.Type),
    [EventTypes.DEATH.Type]: !!query.eventType?.includes(EventTypes.DEATH.Type),
    [EventTypes.UNCATEGORIZED.Type]: !!query.eventType?.includes(
      EventTypes.UNCATEGORIZED.Type,
    ),
    [EventTypes.SCIENTIFIC_STUDY.Type]: !!query.eventType?.includes(
      EventTypes.SCIENTIFIC_STUDY.Type,
    ),
    [EventTypes.PATENT.Type]: !!query.eventType?.includes(
      EventTypes.PATENT.Type,
    ),
    [EventTypes.DOCUMENTARY.Type]: !!query.eventType?.includes(
      EventTypes.DOCUMENTARY.Type,
    ),
    [EventTypes.TRANSACTION.Type]: !!query.eventType?.includes(
      EventTypes.TRANSACTION.Type,
    ),
    [EventTypes.QUOTE.Type]: !!query.eventType?.includes(EventTypes.QUOTE.Type),
  };
};
