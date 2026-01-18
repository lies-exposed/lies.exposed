import { describe, test, expect } from "vitest";
import { type EventTotals } from "../../../io/http/Events/EventTotals.js";
import { EventTotalsHelper } from "../event-totals.helper.js";

describe("EventTotalsHelper", () => {
  test("Should return the correct totals", () => {
    const totals: EventTotals = {
      uncategorized: 0,
      deaths: 0,
      documentaries: 1,
      scientificStudies: 1,
      books: 1,
      quotes: 2,
      patents: 1,
      transactions: 1,
    };

    const total = EventTotalsHelper.getTotal(totals, {
      uncategorized: true,
      deaths: true,
      documentaries: true,
      scientificStudies: false,
      books: true,
      quotes: true,
      patents: true,
      transactions: false,
    });

    expect(total).toBe(6);
  });
});
