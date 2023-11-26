import * as t from "io-ts";

export const BOOK = t.literal("Book");
export type BOOK = t.TypeOf<typeof BOOK>;

export const DEATH = t.literal("Death");
export type DEATH = t.TypeOf<typeof DEATH>;

export const DOCUMENTARY = t.literal("Documentary");
export type DOCUMENTARY = t.TypeOf<typeof DOCUMENTARY>;

export const SCIENTIFIC_STUDY = t.literal("ScientificStudy");
export type SCIENTIFIC_STUDY = t.TypeOf<typeof SCIENTIFIC_STUDY>;

export const PATENT = t.literal("Patent");
export type PATENT = t.TypeOf<typeof PATENT>;

export const TRANSACTION = t.literal("Transaction");
export type TRANSACTION = t.TypeOf<typeof TRANSACTION>;

export const QUOTE = t.literal("Quote");
export type QUOTE = t.TypeOf<typeof QUOTE>;

export const UNCATEGORIZED = t.literal("Uncategorized");
export type UNCATEGORIZED = t.TypeOf<typeof UNCATEGORIZED>;


export const EventType = t.union(
  [
    BOOK,
    DEATH,
    UNCATEGORIZED,
    SCIENTIFIC_STUDY,
    PATENT,
    DOCUMENTARY,
    TRANSACTION,
    QUOTE,
  ],
  "EventType",
);
export type EventType = t.TypeOf<typeof EventType>;

const EventTypes = {
  BOOK,
  DEATH,
  DOCUMENTARY,
  PATENT,
  SCIENTIFIC_STUDY,
  TRANSACTION,
  QUOTE,
  UNCATEGORIZED,
};
export { EventTypes };
