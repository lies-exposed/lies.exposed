import { Schema } from "effect";

export const BOOK = Schema.Literal("Book");
export type BOOK = typeof BOOK.Type;

export const DEATH = Schema.Literal("Death");
export type DEATH = typeof DEATH.Type;

export const DOCUMENTARY = Schema.Literal("Documentary");
export type DOCUMENTARY = typeof DOCUMENTARY.Type;

export const SCIENTIFIC_STUDY = Schema.Literal("ScientificStudy");
export type SCIENTIFIC_STUDY = typeof SCIENTIFIC_STUDY.Type;

export const PATENT = Schema.Literal("Patent");
export type PATENT = typeof PATENT.Type;

export const TRANSACTION = Schema.Literal("Transaction");
export type TRANSACTION = typeof TRANSACTION.Type;

export const QUOTE = Schema.Literal("Quote");
export type QUOTE = typeof QUOTE.Type;

export const UNCATEGORIZED = Schema.Literal("Uncategorized");
export type UNCATEGORIZED = typeof UNCATEGORIZED.Type;

export const EventType = Schema.Union(
  BOOK,
  DEATH,
  UNCATEGORIZED,
  SCIENTIFIC_STUDY,
  PATENT,
  DOCUMENTARY,
  TRANSACTION,
  QUOTE,
).annotations({ title: "EventType" });
export type EventType = typeof EventType.Type;

export const EVENT_TYPES = {
  BOOK: BOOK.literals[0],
  DEATH: DEATH.literals[0],
  DOCUMENTARY: DOCUMENTARY.literals[0],
  PATENT: PATENT.literals[0],
  SCIENTIFIC_STUDY: SCIENTIFIC_STUDY.literals[0],
  TRANSACTION: TRANSACTION.literals[0],
  QUOTE: QUOTE.literals[0],
  UNCATEGORIZED: UNCATEGORIZED.literals[0],
};

const EventTypes = {
  BOOK: BOOK,
  DEATH: DEATH,
  DOCUMENTARY: DOCUMENTARY,
  PATENT: PATENT,
  SCIENTIFIC_STUDY: SCIENTIFIC_STUDY,
  TRANSACTION: TRANSACTION,
  QUOTE: QUOTE,
  UNCATEGORIZED: UNCATEGORIZED,
};

export { EventTypes };
