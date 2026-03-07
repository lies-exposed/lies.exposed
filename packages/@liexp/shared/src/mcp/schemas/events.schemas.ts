import { UUID } from "@liexp/io/lib/http/Common/UUID.js";
import { Schema } from "effect";

export const FindEventsInputSchema = Schema.Struct({
  query: Schema.UndefinedOr(Schema.String).annotations({
    description: "Full-text search query",
  }),
  actors: Schema.UndefinedOr(Schema.Array(UUID)).annotations({
    description: "Filter by actor UUIDs",
  }),
  groups: Schema.UndefinedOr(Schema.Array(UUID)).annotations({
    description: "Filter by group UUIDs",
  }),
  type: Schema.UndefinedOr(Schema.String).annotations({
    description:
      "Filter by event type: Death, ScientificStudy, Patent, Documentary, Transaction, Book, Quote, Uncategorized",
  }),
  startDate: Schema.UndefinedOr(Schema.String).annotations({
    description: "Filter events on or after this date (YYYY-MM-DD)",
  }),
  endDate: Schema.UndefinedOr(Schema.String).annotations({
    description: "Filter events on or before this date (YYYY-MM-DD)",
  }),
  start: Schema.UndefinedOr(Schema.Number).annotations({
    description: "Pagination offset (default: 0)",
  }),
  end: Schema.UndefinedOr(Schema.Number).annotations({
    description: "Pagination limit (default: 20)",
  }),
});

export const GetEventInputSchema = Schema.Struct({
  id: Schema.String.annotations({
    description: "UUID of the event to retrieve",
  }),
});
