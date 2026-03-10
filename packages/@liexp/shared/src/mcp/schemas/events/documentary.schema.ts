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
  authorActors: Schema.UndefinedOr(Schema.Array(UUID)).annotations({
    description: "Author actor UUIDs (comma-separated when passed as CLI arg)",
  }),
  authorGroups: Schema.UndefinedOr(Schema.Array(UUID)).annotations({
    description: "Author group UUIDs (comma-separated when passed as CLI arg)",
  }),
  subjectActors: Schema.UndefinedOr(Schema.Array(UUID)).annotations({
    description: "Subject actor UUIDs (comma-separated when passed as CLI arg)",
  }),
  subjectGroups: Schema.UndefinedOr(Schema.Array(UUID)).annotations({
    description: "Subject group UUIDs (comma-separated when passed as CLI arg)",
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
  authorActors: Schema.UndefinedOr(Schema.Array(UUID)).annotations({
    description: "Author actor UUIDs (comma-separated when passed as CLI arg)",
  }),
  authorGroups: Schema.UndefinedOr(Schema.Array(UUID)).annotations({
    description: "Author group UUIDs (comma-separated when passed as CLI arg)",
  }),
  subjectActors: Schema.UndefinedOr(Schema.Array(UUID)).annotations({
    description: "Subject actor UUIDs (comma-separated when passed as CLI arg)",
  }),
  subjectGroups: Schema.UndefinedOr(Schema.Array(UUID)).annotations({
    description: "Subject group UUIDs (comma-separated when passed as CLI arg)",
  }),
});
