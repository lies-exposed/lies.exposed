import { EventTypes } from "@liexp/shared/lib/io/http/Events/index.js";
import { type SearchEventsQueryInputNoPagination } from "../../../state/queries/SearchEventsQuery.js";
import { type EventTypeFiltersProps } from "./EventTypeFilters.js";

export const searchEventQueryToEventTypeFilters = (
  query: SearchEventsQueryInputNoPagination,
): Required<EventTypeFiltersProps["filters"]> => {
  return {
    [EventTypes.BOOK.literals[0]]: !!query.eventType?.includes(
      EventTypes.BOOK.literals[0],
    ),
    [EventTypes.DEATH.literals[0]]: !!query.eventType?.includes(
      EventTypes.DEATH.literals[0],
    ),
    [EventTypes.UNCATEGORIZED.literals[0]]: !!query.eventType?.includes(
      EventTypes.UNCATEGORIZED.literals[0],
    ),
    [EventTypes.SCIENTIFIC_STUDY.literals[0]]: !!query.eventType?.includes(
      EventTypes.SCIENTIFIC_STUDY.literals[0],
    ),
    [EventTypes.PATENT.literals[0]]: !!query.eventType?.includes(
      EventTypes.PATENT.literals[0],
    ),
    [EventTypes.DOCUMENTARY.literals[0]]: !!query.eventType?.includes(
      EventTypes.DOCUMENTARY.literals[0],
    ),
    [EventTypes.TRANSACTION.literals[0]]: !!query.eventType?.includes(
      EventTypes.TRANSACTION.literals[0],
    ),
    [EventTypes.QUOTE.literals[0]]: !!query.eventType?.includes(
      EventTypes.QUOTE.literals[0],
    ),
  };
};
