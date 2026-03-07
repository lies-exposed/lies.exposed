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
  start: Schema.UndefinedOr(Schema.Number).annotations({
    description: "Pagination offset (default: 0)",
  }),
  end: Schema.UndefinedOr(Schema.Number).annotations({
    description: "Pagination limit (default: 20)",
  }),
});

export const GetMediaInputSchema = Schema.Struct({
  id: Schema.String.annotations({
    description: "UUID of the media to retrieve",
  }),
});
