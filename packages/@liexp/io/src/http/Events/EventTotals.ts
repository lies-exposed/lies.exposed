import { Schema } from "effect";
import { type Monoid } from "fp-ts/Monoid";

export const EventTotals = Schema.Struct({
  uncategorized: Schema.Number,
  books: Schema.Number,
  deaths: Schema.Number,
  scientificStudies: Schema.Number,
  patents: Schema.Number,
  documentaries: Schema.Number,
  transactions: Schema.Number,
  quotes: Schema.Number,
}).annotations({
  title: "EventTotals",
});
export type EventTotals = typeof EventTotals.Type;

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
