import { EVENT_TYPES } from "../../io/http/Events/EventType.js";
import type * as http from "../../io/http/index.js";

export const getTitle = (
  e: http.Events.Event,
  relations: http.Events.EventRelations,
): string => {
  switch (e.type) {
    case EVENT_TYPES.BOOK:
    case EVENT_TYPES.DOCUMENTARY:
    case EVENT_TYPES.PATENT:
    case EVENT_TYPES.SCIENTIFIC_STUDY:
    case EVENT_TYPES.TRANSACTION:
    case EVENT_TYPES.UNCATEGORIZED:
      return e.payload.title;
    case EVENT_TYPES.QUOTE: {
      const byActor = relations?.actors?.[0] ?? { fullName: "Unknown" };
      return `${byActor.fullName} - `.concat(
        e.payload.details
          ? `${e.payload.details}`
          : (e.payload.quote?.split(" ").slice(0, 10).join(" ").concat("...") ??
              ""),
      );
    }
    case EVENT_TYPES.DEATH: {
      const victimName =
        (relations?.actors ?? []).find((a) => a.id === e.payload.victim)
          ?.fullName ?? "unknown";
      return `Death of ${victimName}`;
    }
  }
};

export const getTitleForSearchEvent = (
  e: http.Events.SearchEvent.SearchEvent,
): string => {
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
