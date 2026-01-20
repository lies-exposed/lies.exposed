import { Schema } from "effect";

export const SummitEvent = Schema.Struct({
  year: Schema.NumberFromString,
  label: Schema.String,
}).annotations({
  title: "SummitEvent",
});

export type SummitEvent = typeof SummitEvent.Type;
