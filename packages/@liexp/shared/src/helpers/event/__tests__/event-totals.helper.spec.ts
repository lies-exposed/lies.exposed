import { describe, expect, test } from "vitest";
import { type EventTotals } from "../../../io/http/Events/EventTotals.js";
import { EventTotalsHelper } from "../event-totals.helper.js";

describe("EventTotalsHelper", () => {
  interface TestEventTotalCase {
    totals: EventTotals;
    filters?: Partial<{ [K in keyof EventTotals]: boolean }>;
    expected: number;
  }

  const cases: TestEventTotalCase[] = [
    {
      totals: {
        uncategorized: 1,
        deaths: 1,
        documentaries: 1,
        scientificStudies: 10,
        books: 1,
        quotes: 1,
        patents: 1,
        transactions: 1,
      },
      expected: 18,
    },
    {
      totals: {
        uncategorized: 1,
        deaths: 1,
        documentaries: 1,
        scientificStudies: 10,
        books: 1,
        quotes: 1,
        patents: 1,
        transactions: 1,
      },
      filters: {
        uncategorized: false,
        deaths: false,
        documentaries: false,
        books: false,
        quotes: false,
        patents: false,
        scientificStudies: false,
        transactions: false,
      },
      expected: 0,
    },
  ];

  test.each(cases)(
    "Should return the correct total",
    ({ totals, filters, expected }) => {
      const total = EventTotalsHelper.getTotal(totals, {
        uncategorized: true,
        deaths: true,
        documentaries: true,
        scientificStudies: true,
        books: true,
        quotes: true,
        patents: true,
        transactions: true,
        ...filters,
      });

      expect(total).toBe(expected);
    },
  );
});
