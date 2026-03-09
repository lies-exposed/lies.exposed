import { UUID } from "@liexp/io/lib/http/Common/UUID.js";
import { Schema } from "effect";
import { EventCreateBaseSchema, EventEditBaseSchema } from "./base.schema.js";

export const CreateScientificStudyEventSchema = Schema.Struct({
  ...EventCreateBaseSchema.fields,
  title: Schema.String.annotations({
    description: "Study title (required)",
  }),
  studyUrl: UUID.annotations({
    description: "Link UUID for the study URL (required)",
  }),
  image: Schema.UndefinedOr(UUID).annotations({
    description: "Media UUID for the study image",
  }),
  publisher: Schema.UndefinedOr(UUID).annotations({
    description: "Actor UUID of the publisher",
  }),
  authors: Schema.UndefinedOr(Schema.String).annotations({
    description: "Comma-separated actor UUIDs of authors",
  }),
});

export const EditScientificStudyEventSchema = Schema.Struct({
  ...EventEditBaseSchema.fields,
  title: Schema.UndefinedOr(Schema.String).annotations({
    description: "Study title",
  }),
  studyUrl: Schema.UndefinedOr(UUID).annotations({
    description: "Link UUID for the study URL",
  }),
  image: Schema.UndefinedOr(UUID).annotations({
    description: "Media UUID for the study image",
  }),
  publisher: Schema.UndefinedOr(UUID).annotations({
    description: "Actor UUID of the publisher",
  }),
  authors: Schema.UndefinedOr(Schema.String).annotations({
    description: "Comma-separated actor UUIDs of authors",
  }),
});
