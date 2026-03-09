import { UUID } from "@liexp/io/lib/http/Common/UUID.js";
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
  location: Schema.String.annotations({
    description: "URL of the media file (required)",
  }),
  type: Schema.String.annotations({
    description:
      "Media MIME type (required), e.g. image/jpg, video/mp4, application/pdf",
  }),
  label: Schema.UndefinedOr(Schema.String).annotations({
    description: "Human-readable label for the media",
  }),
  description: Schema.UndefinedOr(Schema.String).annotations({
    description: "Description of the media",
  }),
  thumbnail: Schema.UndefinedOr(Schema.String).annotations({
    description: "URL of thumbnail image",
  }),
  events: Schema.UndefinedOr(Schema.String).annotations({
    description: "Comma-separated event UUIDs to associate",
  }),
  links: Schema.UndefinedOr(Schema.String).annotations({
    description: "Comma-separated link UUIDs to associate",
  }),
  keywords: Schema.UndefinedOr(Schema.String).annotations({
    description: "Comma-separated keyword UUIDs to associate",
  }),
  areas: Schema.UndefinedOr(Schema.String).annotations({
    description: "Comma-separated area UUIDs to associate",
  }),
});

export type CreateMediaInputSchema = typeof CreateMediaInputSchema.Type;

export const EditMediaInputSchema = Schema.Struct({
  id: UUID.annotations({
    description: "UUID of the media to edit (required)",
  }),
  location: Schema.String.annotations({
    description: "URL of the media file (required)",
  }),
  type: Schema.String.annotations({
    description: "Media MIME type (required), e.g. image/jpg, video/mp4",
  }),
  label: Schema.String.annotations({
    description: "Human-readable label for the media (required)",
  }),
  description: Schema.UndefinedOr(Schema.String).annotations({
    description: "Description of the media",
  }),
  thumbnail: Schema.UndefinedOr(Schema.String).annotations({
    description: "URL of thumbnail image",
  }),
  events: Schema.UndefinedOr(UUID).annotations({
    description: "Comma-separated event UUIDs",
  }),
  links: Schema.UndefinedOr(UUID).annotations({
    description: "Comma-separated link UUIDs",
  }),
  keywords: Schema.UndefinedOr(UUID).annotations({
    description: "Comma-separated keyword UUIDs",
  }),
  areas: Schema.UndefinedOr(UUID).annotations({
    description: "Comma-separated area UUIDs",
  }),
});

export type EditMediaInputSchema = typeof EditMediaInputSchema.Type;
