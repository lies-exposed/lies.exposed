import { UUID } from "@liexp/io/lib/http/Common/UUID.js";
import { Schema } from "effect";
import { StringToBlockNoteDocument } from "../../../providers/blocknote/utils.js";

export const EventCreateBaseSchema = Schema.Struct({
  date: Schema.DateFromString.annotations({
    description: "Event date YYYY-MM-DD (required)",
  }),
  draft: Schema.UndefinedOr(Schema.BooleanFromString).annotations({
    description: "Draft flag (default: false)",
  }),
  excerpt: Schema.UndefinedOr(StringToBlockNoteDocument).annotations({
    description: "Short excerpt text as plain text",
  }),
  links: Schema.UndefinedOr(Schema.Array(UUID)).annotations({
    description:
      "Link UUIDs to associate (comma-separated when passed as CLI arg)",
  }),
  media: Schema.UndefinedOr(Schema.Array(UUID)).annotations({
    description:
      "Media UUIDs to associate (comma-separated when passed as CLI arg)",
  }),
  keywords: Schema.UndefinedOr(Schema.Array(UUID)).annotations({
    description:
      "Keyword UUIDs to associate (comma-separated when passed as CLI arg)",
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
  excerpt: Schema.UndefinedOr(StringToBlockNoteDocument).annotations({
    description: "Short excerpt text as plain text",
  }),
  links: Schema.UndefinedOr(Schema.Array(UUID)).annotations({
    description:
      "Link UUIDs to associate (comma-separated when passed as CLI arg)",
  }),
  media: Schema.UndefinedOr(Schema.Array(UUID)).annotations({
    description:
      "Media UUIDs to associate (comma-separated when passed as CLI arg)",
  }),
  keywords: Schema.UndefinedOr(Schema.Array(UUID)).annotations({
    description:
      "Keyword UUIDs to associate (comma-separated when passed as CLI arg)",
  }),
});
