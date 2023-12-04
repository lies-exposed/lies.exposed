import * as http from "../../io/http";

export const getTitle = (
  e: http.Events.Event,
  relations: http.Events.EventRelations,
): string => {
  switch (e.type) {
    case http.Events.EventTypes.BOOK.value:
    case http.Events.EventTypes.DOCUMENTARY.value:
    case http.Events.EventTypes.PATENT.value:
    case http.Events.EventTypes.SCIENTIFIC_STUDY.value:
    case http.Events.EventTypes.TRANSACTION.value:
    case http.Events.EventTypes.UNCATEGORIZED.value:
      return e.payload.title;
    case http.Events.EventTypes.QUOTE.value: {
      const byActor = relations?.actors?.[0] ?? { fullName: "Unknown" };
      return `${byActor.fullName} - `.concat(
        e.payload.details
          ? `${e.payload.details}`
          : e.payload.quote?.split(" ").slice(0, 10).join(" ").concat("...") ??
              "",
      );
    }
    case http.Events.EventTypes.DEATH.value: {
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
    case http.Events.EventTypes.QUOTE.value:
      return `Quote by ${
        e.payload.subject.type === "Group"
          ? e.payload.subject.id?.name
          : e.payload.subject.id?.fullName
      }`;
    case http.Events.EventTypes.DEATH.value:
      return `Death of ${e.payload?.victim?.fullName}`;
    case http.Events.EventTypes.DOCUMENTARY.value:
    case http.Events.EventTypes.PATENT.value:
    case http.Events.EventTypes.SCIENTIFIC_STUDY.value:
    case http.Events.EventTypes.TRANSACTION.value:
    case http.Events.EventTypes.UNCATEGORIZED.value:
    case http.Events.EventTypes.BOOK.value:
      return e.payload.title;
    default:
      return "no title given";
  }
};
