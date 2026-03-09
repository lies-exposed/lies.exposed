import { UUID } from "@liexp/io/lib/http/Common/UUID.js";
import { Schema } from "effect";
import { EventCreateBaseSchema, EventEditBaseSchema } from "./base.schema.js";

export const CreateQuoteEventSchema = Schema.Struct({
  ...EventCreateBaseSchema.fields,
  actor: Schema.UndefinedOr(UUID).annotations({
    description: "Actor UUID who made the quote",
  }),
  quote: Schema.UndefinedOr(Schema.String).annotations({
    description: "Quote text",
  }),
  details: Schema.UndefinedOr(Schema.String).annotations({
    description: "Additional details",
  }),
});

export const EditQuoteEventSchema = Schema.Struct({
  ...EventEditBaseSchema.fields,
  actor: Schema.UndefinedOr(UUID).annotations({
    description: "Actor UUID who made the quote",
  }),
  quote: Schema.UndefinedOr(Schema.String).annotations({
    description: "Quote text",
  }),
  details: Schema.UndefinedOr(Schema.String).annotations({
    description: "Additional details",
  }),
});
