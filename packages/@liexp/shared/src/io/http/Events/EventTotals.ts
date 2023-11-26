import { type Monoid } from 'fp-ts/Monoid';
import * as t from "io-ts";


export const EventTotals = t.strict(
  {
    uncategorized: t.number,
    books: t.number,
    deaths: t.number,
    scientificStudies: t.number,
    patents: t.number,
    documentaries: t.number,
    transactions: t.number,
    quotes: t.number,
  },
  "EventTotals"
);
export type EventTotals = t.TypeOf<typeof EventTotals>;

export const EventTotalsMonoid: Monoid<EventTotals> = {
  empty: {
    uncategorized: 0,
    documentaries: 0,
    scientificStudies: 0,
    quotes: 0,
    patents: 0,
    transactions: 0,
    deaths: 0,
    books: 0,
  },
  concat(x, y) {
    return {
      uncategorized: x.uncategorized + y.uncategorized,
      documentaries: x.documentaries + y.documentaries,
      scientificStudies: x.scientificStudies + y.scientificStudies,
      quotes: x.quotes + y.quotes,
      patents: x.patents + y.patents,
      transactions: x.transactions + y.transactions,
      deaths: x.deaths + y.deaths,
      books: x.books + y.books,
    };
  },
};

