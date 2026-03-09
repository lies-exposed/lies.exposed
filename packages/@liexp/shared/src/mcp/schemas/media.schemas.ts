import { URL } from "@liexp/io/lib/http/Common/URL.js";
import { UUID } from "@liexp/io/lib/http/Common/UUID.js";
import { MediaType } from "@liexp/io/lib/http/Media/index.js";
import { Schema } from "effect";

export const FindMediaInputSchema = Schema.Struct({
  query: Schema.UndefinedOr(Schema.String).annotations({
    description: "Search query string to filter media by label or description",
  }),
  sort: Schema.UndefinedOr(
    Schema.Union(Schema.Literal("createdAt"), Schema.Literal("label")),
  ).annotations({
    description: 'Sort field: "createdAt" or "label"',
  }),
  order: Schema.UndefinedOr(
    Schema.Union(Schema.Literal("ASC"), Schema.Literal("DESC")),
  ).annotations({
    description: 'Sort order: "ASC" or "DESC"',
  }),
  start: Schema.UndefinedOr(Schema.NumberFromString).annotations({
    description: "Pagination offset (default: 0)",
  }),
  end: Schema.UndefinedOr(Schema.NumberFromString).annotations({
    description: "Pagination limit (default: 20)",
  }),
});

export const GetMediaInputSchema = Schema.Struct({
  id: UUID.annotations({
    description: "UUID of the media to retrieve",
  }),
});

export const CreateMediaInputSchema = Schema.Struct({
  location: URL.annotations({
    description: "URL of the media file (required)",
  }),
  type: MediaType.annotations({
    description:
      "Media MIME type (required), e.g. image/jpg, video/mp4, application/pdf",
  }),
  label: Schema.UndefinedOr(Schema.String).annotations({
    description: "Human-readable label for the media",
  }),
  description: Schema.UndefinedOr(Schema.String).annotations({
    description: "Description of the media",
  }),
  thumbnail: Schema.UndefinedOr(URL).annotations({
    description: "URL of thumbnail image",
  }),
  events: Schema.UndefinedOr(Schema.Array(UUID)).annotations({
    description:
      "Event UUIDs to associate (comma-separated when passed as CLI arg)",
  }),
  links: Schema.UndefinedOr(Schema.Array(UUID)).annotations({
    description:
      "Link UUIDs to associate (comma-separated when passed as CLI arg)",
  }),
  keywords: Schema.UndefinedOr(Schema.Array(UUID)).annotations({
    description:
      "Keyword UUIDs to associate (comma-separated when passed as CLI arg)",
  }),
  areas: Schema.UndefinedOr(Schema.Array(UUID)).annotations({
    description:
      "Area UUIDs to associate (comma-separated when passed as CLI arg)",
  }),
});

export type CreateMediaInputSchema = typeof CreateMediaInputSchema.Type;

export const EditMediaInputSchema = Schema.Struct({
  id: UUID.annotations({
    description: "UUID of the media to edit (required)",
  }),
  location: URL.annotations({
    description: "URL of the media file (required)",
  }),
  type: MediaType.annotations({
    description: "Media MIME type (required), e.g. image/jpg, video/mp4",
  }),
  label: Schema.String.annotations({
    description: "Human-readable label for the media (required)",
  }),
  description: Schema.UndefinedOr(Schema.String).annotations({
    description: "Description of the media",
  }),
  thumbnail: Schema.UndefinedOr(URL).annotations({
    description: "URL of thumbnail image",
  }),
  events: Schema.UndefinedOr(Schema.Array(UUID)).annotations({
    description:
      "Event UUIDs to associate (comma-separated when passed as CLI arg)",
  }),
  links: Schema.UndefinedOr(Schema.Array(UUID)).annotations({
    description:
      "Link UUIDs to associate (comma-separated when passed as CLI arg)",
  }),
  keywords: Schema.UndefinedOr(Schema.Array(UUID)).annotations({
    description:
      "Keyword UUIDs to associate (comma-separated when passed as CLI arg)",
  }),
  areas: Schema.UndefinedOr(Schema.Array(UUID)).annotations({
    description:
      "Area UUIDs to associate (comma-separated when passed as CLI arg)",
  }),
});

export type EditMediaInputSchema = typeof EditMediaInputSchema.Type;
