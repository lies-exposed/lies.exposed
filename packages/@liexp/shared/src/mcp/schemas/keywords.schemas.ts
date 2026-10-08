import { Schema } from "effect";
import { UUID, Tag } from "@liexp/io/lib/http/Common/index.js";
import { Color } from "@liexp/io/lib/http/Common/Color.js";

export const FindKeywordsInputSchema = Schema.Struct({
  q: Schema.UndefinedOr(Schema.String).annotations({
    description: "Search query (partial match on tag)",
  }),
  ids: Schema.UndefinedOr(Schema.Array(UUID)).annotations({
    description: "Array of keyword UUIDs to filter by",
  }),
  sort: Schema.Union(
    Schema.Literal("createdAt"),
    Schema.Literal("updatedAt"),
    Schema.Literal("tag"),
    Schema.Undefined,
  ).annotations({
    description: 'Sort field: "createdAt", "updatedAt", or "tag"',
  }),
  order: Schema.Union(
    Schema.Literal("ASC"),
    Schema.Literal("DESC"),
    Schema.Undefined,
  ).annotations({
    description: 'Sort order: "ASC" for ascending or "DESC" for descending',
  }),
  start: Schema.UndefinedOr(Schema.NumberFromString).annotations({
    description: "Pagination start index",
  }),
  end: Schema.UndefinedOr(Schema.NumberFromString).annotations({
    description: "Pagination end index",
  }),
});
export type FindKeywordsInputSchema = typeof FindKeywordsInputSchema.Type;

export const GetKeywordInputSchema = Schema.Struct({
  id: UUID.annotations({
    description: "UUID of the keyword to retrieve",
  }),
});
export type GetKeywordInputSchema = typeof GetKeywordInputSchema.Type;

export const CreateKeywordInputSchema = Schema.Struct({
  tag: Tag.annotations({
    description: "Tag identifier for the keyword (required)",
  }),
  color: Schema.UndefinedOr(Color).annotations({
    description: "Hex color without # (default: random)",
  }),
});
export type CreateKeywordInputSchema = typeof CreateKeywordInputSchema.Type;

export const EditKeywordInputSchema = Schema.Struct({
  id: UUID.annotations({
    description: "UUID of the keyword to edit",
  }),
  tag: Schema.UndefinedOr(Tag).annotations({
    description: "Tag identifier or null to keep current",
  }),
  color: Schema.UndefinedOr(Color).annotations({
    description: "Hex color without # or null to keep current",
  }),
});
export type EditKeywordInputSchema = typeof EditKeywordInputSchema.Type;
