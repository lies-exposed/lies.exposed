import { type EventTotals } from "@liexp/io/lib/http/Events/EventTotals.js";

const getTotal = (
  totals: EventTotals,
  filters: { [K in keyof EventTotals]: boolean },
): number => {
  return (
    (filters.deaths ? totals.deaths : 0) +
    (filters.documentaries ? totals.documentaries : 0) +
    (filters.patents ? totals.patents : 0) +
    (filters.scientificStudies ? totals.scientificStudies : 0) +
    (filters.transactions ? totals.transactions : 0) +
    (filters.books ? totals.books : 0) +
    (filters.quotes ? totals.quotes : 0) +
    (filters.patents ? totals.patents : 0) +
    (filters.uncategorized ? totals.uncategorized : 0)
  );
};

const EventTotalsHelper = {
  getTotal,
};

export { EventTotalsHelper };
