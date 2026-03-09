import { UUID } from "@liexp/io/lib/http/Common/UUID.js";
import { Schema } from "effect";
import { EventCreateBaseSchema, EventEditBaseSchema } from "./base.schema.js";

export const CreateDocumentaryEventSchema = Schema.Struct({
  ...EventCreateBaseSchema.fields,
  title: Schema.String.annotations({
    description: "Documentary title (required)",
  }),
  documentaryMedia: UUID.annotations({
    description: "Media UUID for the documentary (required)",
  }),
  website: Schema.UndefinedOr(UUID).annotations({
    description: "Link UUID for the documentary website",
  }),
  authorActors: Schema.UndefinedOr(Schema.String).annotations({
    description: "Comma-separated actor UUIDs as authors",
  }),
  authorGroups: Schema.UndefinedOr(Schema.String).annotations({
    description: "Comma-separated group UUIDs as authors",
  }),
  subjectActors: Schema.UndefinedOr(Schema.String).annotations({
    description: "Comma-separated actor UUIDs as subjects",
  }),
  subjectGroups: Schema.UndefinedOr(Schema.String).annotations({
    description: "Comma-separated group UUIDs as subjects",
  }),
});

export const EditDocumentaryEventSchema = Schema.Struct({
  ...EventEditBaseSchema.fields,
  title: Schema.UndefinedOr(Schema.String).annotations({
    description: "Documentary title",
  }),
  documentaryMedia: Schema.UndefinedOr(UUID).annotations({
    description: "Media UUID for the documentary",
  }),
  website: Schema.UndefinedOr(UUID).annotations({
    description: "Link UUID for the documentary website",
  }),
  authorActors: Schema.UndefinedOr(Schema.String).annotations({
    description: "Comma-separated actor UUIDs as authors",
  }),
  authorGroups: Schema.UndefinedOr(Schema.String).annotations({
    description: "Comma-separated group UUIDs as authors",
  }),
  subjectActors: Schema.UndefinedOr(Schema.String).annotations({
    description: "Comma-separated actor UUIDs as subjects",
  }),
  subjectGroups: Schema.UndefinedOr(Schema.String).annotations({
    description: "Comma-separated group UUIDs as subjects",
  }),
});
