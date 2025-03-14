import * as http from "../../io/http/index.js";

export const getTitle = (
  e: http.Events.Event,
  relations: http.Events.EventRelations,
): string => {
  switch (e.type) {
    case http.Events.EventTypes.BOOK.Type:
    case http.Events.EventTypes.DOCUMENTARY.Type:
    case http.Events.EventTypes.PATENT.Type:
    case http.Events.EventTypes.SCIENTIFIC_STUDY.Type:
    case http.Events.EventTypes.TRANSACTION.Type:
    case http.Events.EventTypes.UNCATEGORIZED.Type:
      return e.payload.title;
    case http.Events.EventTypes.QUOTE.Type: {
      const byActor = relations?.actors?.[0] ?? { fullName: "Unknown" };
      return `${byActor.fullName} - `.concat(
        e.payload.details
          ? `${e.payload.details}`
          : (e.payload.quote?.split(" ").slice(0, 10).join(" ").concat("...") ??
              ""),
      );
    }
    case http.Events.EventTypes.DEATH.Type: {
      const victimName =
        (e.payload?.victim as any)?.fullName ??
        (relations?.actors ?? []).find((a) => a.id === e.payload.victim)
          ?.fullName ??
        "unknown";
      return `Death of ${victimName}`;
    }
  }
};

export const getTitleForSearchEvent = (
  e: http.Events.SearchEvent.SearchEvent,
): string => {
  switch (e.type) {
    case http.Events.EventTypes.QUOTE.Type:
      return `Quote by ${
        e.payload.subject.type === "Group"
          ? e.payload.subject.id?.name
          : e.payload.subject.id?.fullName
      }`;
    case http.Events.EventTypes.DEATH.Type:
      return `Death of ${e.payload?.victim?.fullName}`;
    case http.Events.EventTypes.DOCUMENTARY.Type:
    case http.Events.EventTypes.PATENT.Type:
    case http.Events.EventTypes.SCIENTIFIC_STUDY.Type:
    case http.Events.EventTypes.TRANSACTION.Type:
    case http.Events.EventTypes.UNCATEGORIZED.Type:
    case http.Events.EventTypes.BOOK.Type:
      return e.payload.title;
    default:
      return "no title given";
  }
};
