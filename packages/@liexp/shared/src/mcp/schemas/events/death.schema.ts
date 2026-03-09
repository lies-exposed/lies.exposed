import { UUID } from "@liexp/io/lib/http/Common/UUID.js";
import { Schema } from "effect";
import { EventCreateBaseSchema, EventEditBaseSchema } from "./base.schema.js";

export const CreateDeathEventSchema = Schema.Struct({
  ...EventCreateBaseSchema.fields,
  victim: UUID.annotations({
    description: "Actor UUID of the victim (required)",
  }),
  location: Schema.UndefinedOr(UUID).annotations({
    description: "Area UUID for event location",
  }),
});

export const EditDeathEventSchema = Schema.Struct({
  ...EventEditBaseSchema.fields,
  victim: Schema.UndefinedOr(UUID).annotations({
    description: "Actor UUID of the victim",
  }),
  location: Schema.UndefinedOr(UUID).annotations({
    description: "Area UUID for event location",
  }),
});
