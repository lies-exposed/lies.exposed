import { UUID } from "@liexp/io/lib/http/Common/UUID.js";
import { Schema } from "effect";

export const FindNationsInputSchema = Schema.Struct({
  name: Schema.UndefinedOr(Schema.String).annotations({
    description: "Filter by nation name (partial match)",
  }),
  start: Schema.UndefinedOr(Schema.NumberFromString).annotations({
    description: "Pagination offset (default: 0)",
  }),
  end: Schema.UndefinedOr(Schema.NumberFromString).annotations({
    description: "Pagination limit (default: 20)",
  }),
});

export const GetNationInputSchema = Schema.Struct({
  id: UUID.annotations({
    description: "UUID of the nation to retrieve",
  }),
});
