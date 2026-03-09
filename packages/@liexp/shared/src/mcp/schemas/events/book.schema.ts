import { UUID } from "@liexp/io/lib/http/Common/UUID.js";
import { Schema } from "effect";
import { EventCreateBaseSchema, EventEditBaseSchema } from "./base.schema.js";

export const CreateBookEventSchema = Schema.Struct({
  ...EventCreateBaseSchema.fields,
  title: Schema.String.annotations({
    description: "Book title (required)",
  }),
  pdf: UUID.annotations({
    description: "Media UUID for the PDF (required)",
  }),
  audio: Schema.UndefinedOr(UUID).annotations({
    description: "Media UUID for audio version",
  }),
  authors: Schema.UndefinedOr(Schema.String).annotations({
    description: "Comma-separated actor UUIDs of authors",
  }),
  publisher: Schema.UndefinedOr(UUID).annotations({
    description: "Actor UUID of the publisher",
  }),
});

export const EditBookEventSchema = Schema.Struct({
  ...EventEditBaseSchema.fields,
  title: Schema.UndefinedOr(Schema.String).annotations({
    description: "Book title",
  }),
  pdf: Schema.UndefinedOr(UUID).annotations({
    description: "Media UUID for the PDF",
  }),
  audio: Schema.UndefinedOr(UUID).annotations({
    description: "Media UUID for audio version",
  }),
  authors: Schema.UndefinedOr(Schema.String).annotations({
    description: "Comma-separated actor UUIDs of authors",
  }),
  publisher: Schema.UndefinedOr(UUID).annotations({
    description: "Actor UUID of the publisher",
  }),
});
