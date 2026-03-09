import { UUID } from "@liexp/io/lib/http/Common/UUID.js";
import { Schema } from "effect";

export const FindAreasInputSchema = Schema.Struct({
  query: Schema.UndefinedOr(Schema.String).annotations({
    description: "Search query string to filter areas by label",
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

export const GetAreaInputSchema = Schema.Struct({
  id: UUID.annotations({
    description: "UUID of the area to retrieve",
  }),
});

export const CreateAreaInputSchema = Schema.Struct({
  label: Schema.String.annotations({
    description: "Area label / name (required)",
  }),
  slug: Schema.String.annotations({
    description: "URL slug for the area (required)",
  }),
  draft: Schema.UndefinedOr(Schema.BooleanFromString).annotations({
    description: "Draft flag (default: false)",
  }),
  geometry: Schema.UndefinedOr(Schema.String).annotations({
    description:
      "GeoJSON geometry as a JSON string (optional, e.g. Point/Polygon)",
  }),
});

export type CreateAreaInputSchema = typeof CreateAreaInputSchema.Type;

export const EditAreaInputSchema = Schema.Struct({
  id: UUID.annotations({
    description: "UUID of the area to edit (required)",
  }),
  label: Schema.UndefinedOr(Schema.String).annotations({
    description: "Area label / name",
  }),
  slug: Schema.UndefinedOr(Schema.String).annotations({
    description: "URL slug for the area",
  }),
  draft: Schema.UndefinedOr(Schema.BooleanFromString).annotations({
    description: "Draft flag",
  }),
  geometry: Schema.UndefinedOr(Schema.String).annotations({
    description: "GeoJSON geometry as a JSON string",
  }),
  featuredImage: Schema.UndefinedOr(UUID).annotations({
    description: "Media UUID for the featured image",
  }),
  media: Schema.UndefinedOr(UUID).annotations({
    description: "Comma-separated media UUIDs",
  }),
  events: Schema.UndefinedOr(UUID).annotations({
    description: "Comma-separated event UUIDs",
  }),
});

export type EditAreaInputSchema = typeof EditAreaInputSchema.Type;
