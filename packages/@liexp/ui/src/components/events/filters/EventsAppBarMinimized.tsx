import { EventTypes } from "@liexp/shared/lib/io/http/Events/index.js";
import { type SearchEventsQueryInputNoPagination } from "../../../state/queries/SearchEventsQuery.js";
import { type EventTypeFiltersProps } from "./EventTypeFilters.js";

export const searchEventQueryToEventTypeFilters = (
  query: SearchEventsQueryInputNoPagination,
): Required<EventTypeFiltersProps["filters"]> => {
  return {
    [EventTypes.BOOK.value]: !!query.eventType?.includes(EventTypes.BOOK.value),
    [EventTypes.DEATH.value]: !!query.eventType?.includes(
      EventTypes.DEATH.value,
    ),
    [EventTypes.UNCATEGORIZED.value]: !!query.eventType?.includes(
      EventTypes.UNCATEGORIZED.value,
    ),
    [EventTypes.SCIENTIFIC_STUDY.value]: !!query.eventType?.includes(
      EventTypes.SCIENTIFIC_STUDY.value,
    ),
    [EventTypes.PATENT.value]: !!query.eventType?.includes(
      EventTypes.PATENT.value,
    ),
    [EventTypes.DOCUMENTARY.value]: !!query.eventType?.includes(
      EventTypes.DOCUMENTARY.value,
    ),
    [EventTypes.TRANSACTION.value]: !!query.eventType?.includes(
      EventTypes.TRANSACTION.value,
    ),
    [EventTypes.QUOTE.value]: !!query.eventType?.includes(
      EventTypes.QUOTE.value,
    ),
  };
};
