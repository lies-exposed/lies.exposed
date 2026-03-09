import { UUID } from "@liexp/io/lib/http/Common/UUID.js";
import { Schema } from "effect";

export const EventCreateBaseSchema = Schema.Struct({
  date: Schema.DateFromString.annotations({
    description: "Event date YYYY-MM-DD (required)",
  }),
  draft: Schema.UndefinedOr(Schema.BooleanFromString).annotations({
    description: "Draft flag (default: false)",
  }),
  excerpt: Schema.UndefinedOr(Schema.String).annotations({
    description: "Short excerpt text",
  }),
  links: Schema.UndefinedOr(Schema.String).annotations({
    description: "Comma-separated link UUIDs",
  }),
  media: Schema.UndefinedOr(Schema.String).annotations({
    description: "Comma-separated media UUIDs",
  }),
  keywords: Schema.UndefinedOr(Schema.String).annotations({
    description: "Comma-separated keyword UUIDs",
  }),
});

export const EventEditBaseSchema = Schema.Struct({
  id: UUID.annotations({
    description: "UUID of the event to edit (required)",
  }),
  date: Schema.UndefinedOr(Schema.DateFromString).annotations({
    description: "Event date YYYY-MM-DD",
  }),
  draft: Schema.UndefinedOr(Schema.BooleanFromString).annotations({
    description: "Draft flag",
  }),
  excerpt: Schema.UndefinedOr(Schema.String).annotations({
    description: "Short excerpt text",
  }),
  links: Schema.UndefinedOr(Schema.String).annotations({
    description: "Comma-separated link UUIDs",
  }),
  media: Schema.UndefinedOr(Schema.String).annotations({
    description: "Comma-separated media UUIDs",
  }),
  keywords: Schema.UndefinedOr(Schema.String).annotations({
    description: "Comma-separated keyword UUIDs",
  }),
});
