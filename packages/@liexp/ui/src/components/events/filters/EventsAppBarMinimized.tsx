import { EVENT_TYPES } from "@liexp/shared/lib/io/http/Events/EventType.js";
import { type SearchEventsQueryInputNoPagination } from "../../../state/queries/SearchEventsQuery.js";
import { type EventTypeFiltersProps } from "./EventTypeFilters.js";

export const searchEventQueryToEventTypeFilters = (
  query: SearchEventsQueryInputNoPagination,
): Required<EventTypeFiltersProps["filters"]> => {
  return {
    [EVENT_TYPES.BOOK]: !!query.eventType?.includes(EVENT_TYPES.BOOK),
    [EVENT_TYPES.DEATH]: !!query.eventType?.includes(EVENT_TYPES.DEATH),
    [EVENT_TYPES.UNCATEGORIZED]: !!query.eventType?.includes(
      EVENT_TYPES.UNCATEGORIZED,
    ),
    [EVENT_TYPES.SCIENTIFIC_STUDY]: !!query.eventType?.includes(
      EVENT_TYPES.SCIENTIFIC_STUDY,
    ),
    [EVENT_TYPES.PATENT]: !!query.eventType?.includes(EVENT_TYPES.PATENT),
    [EVENT_TYPES.DOCUMENTARY]: !!query.eventType?.includes(
      EVENT_TYPES.DOCUMENTARY,
    ),
    [EVENT_TYPES.TRANSACTION]: !!query.eventType?.includes(
      EVENT_TYPES.TRANSACTION,
    ),
    [EVENT_TYPES.QUOTE]: !!query.eventType?.includes(EVENT_TYPES.QUOTE),
  };
};
