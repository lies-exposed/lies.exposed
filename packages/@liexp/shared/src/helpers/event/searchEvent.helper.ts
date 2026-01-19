import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { type Option } from "fp-ts/lib/Option.js";
import { EVENT_TYPES, type EventType } from "../../io/http/Events/EventType.js";
import { type SearchEvent } from "../../io/http/Events/index.js";
import { buildEvent, EventHelper } from "./event.helper.js";
import { EventsMapper } from "./events-mapper.helper.js";
import { getRelationIdsFromEventRelations } from "./getEventRelationIds.js";
import { getSearchEventRelations } from "./getSearchEventRelations.js";

interface SearchEventHelper<E extends SearchEvent.SearchEvent> {
  getTitle: (event: E) => string;
  transform: <EE extends SearchEvent.SearchEvent>(
    event: EE,
    targetType: EventType,
  ) => Option<E>;
}

const transform = <EE extends SearchEvent.SearchEvent>(
  event: EE,
  _eventType: EventType,
): Option<SearchEvent.SearchEvent> => {
  const plainEvent = EventsMapper.fromSearchEvent(event);
  const relations = getSearchEventRelations(event);
  const commonProps = EventHelper.getCommonProps(plainEvent, relations);
  const relationIds = getRelationIdsFromEventRelations(relations);
  const transformedEvent = pipe(
    buildEvent(_eventType, {
      ...commonProps,
      ...relationIds,
    }),
    fp.O.map((e) => EventsMapper.toSearchEvent(e, relations)),
  );

  return pipe(
    transformedEvent,
    fp.O.map((te) => ({ ...event, ...te }) as SearchEvent.SearchEvent),
  );
};

const getTitle = (e: SearchEvent.SearchEvent): string => {
  switch (e.type) {
    case EVENT_TYPES.QUOTE:
      return `Quote by ${
        e.payload.subject.type === "Group"
          ? e.payload.subject.id?.name
          : e.payload.subject.id?.fullName
      }`;
    case EVENT_TYPES.DEATH:
      return `Death of ${e.payload?.victim?.fullName}`;
    case EVENT_TYPES.DOCUMENTARY:
    case EVENT_TYPES.PATENT:
    case EVENT_TYPES.SCIENTIFIC_STUDY:
    case EVENT_TYPES.TRANSACTION:
    case EVENT_TYPES.UNCATEGORIZED:
    case EVENT_TYPES.BOOK:
      return e.payload.title;
    default:
      return "no title given";
  }
};

const SearchEventHelper: SearchEventHelper<SearchEvent.SearchEvent> = {
  getTitle,
  transform,
};

export { SearchEventHelper };
