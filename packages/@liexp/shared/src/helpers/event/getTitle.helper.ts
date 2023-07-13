import * as http from "../../io/http";

export const getTitle = (
  e: http.Events.Event,
  relations: http.Events.EventRelations,
): string => {
  switch (e.type) {
    case http.Events.Documentary.DOCUMENTARY.value:
    case http.Events.Patent.PATENT.value:
    case http.Events.ScientificStudy.SCIENTIFIC_STUDY.value:
    case http.Events.Transaction.TRANSACTION.value:
    case http.Events.Uncategorized.UNCATEGORIZED.value:
      return e.payload.title;
    case http.Events.Quote.QUOTE.value: {
      const byActor = relations?.actors?.[0] ?? { fullName: "Unknown" };
      return `${byActor.fullName} - `.concat(
        e.payload.details
          ? `${e.payload.details}`
          : e.payload.quote?.split(" ").slice(0, 10).join(" ").concat("...") ??
              "",
      );
    }
    case http.Events.Death.DEATH.value: {
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
    case http.Events.Quote.QUOTE.value:
      return `Quote by ${e.payload.actor?.fullName}`;
    case http.Events.Death.DEATH.value:
      return `Death of ${e.payload?.victim?.fullName}`;
    case http.Events.Documentary.DOCUMENTARY.value:
    case http.Events.Patent.PATENT.value:
    case http.Events.ScientificStudy.SCIENTIFIC_STUDY.value:
    case http.Events.Transaction.TRANSACTION.value:
    case http.Events.Uncategorized.UNCATEGORIZED.value:
      return e.payload.title;
    default:
      return "no title given";
  }
};
