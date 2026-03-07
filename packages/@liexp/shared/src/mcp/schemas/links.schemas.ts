import { Schema } from "effect";

export const FindLinksInputSchema = Schema.Struct({
  query: Schema.UndefinedOr(Schema.String).annotations({
    description: "Search query string to filter links by title or URL",
  }),
  sort: Schema.UndefinedOr(
    Schema.Union(
      Schema.Literal("createdAt"),
      Schema.Literal("title"),
      Schema.Literal("url"),
    ),
  ).annotations({
    description: 'Sort field: "createdAt", "title", or "url"',
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

export const GetLinkInputSchema = Schema.Struct({
  id: Schema.String.annotations({
    description: "UUID of the link to retrieve",
  }),
});

export const CreateLinkInputSchema = Schema.Struct({
  url: Schema.String.annotations({
    description: "URL of the link (required)",
  }),
});
