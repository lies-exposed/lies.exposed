import { URL } from "@liexp/io/lib/http/Common";
import { UUID } from "@liexp/io/lib/http/Common/UUID.js";
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
  id: UUID.annotations({
    description: "UUID of the link to retrieve",
  }),
});

export const CreateLinkInputSchema = Schema.Struct({
  url: URL.annotations({
    description: "URL of the link (required)",
  }),
});

export const EditLinkInputSchema = Schema.Struct({
  id: UUID.annotations({
    description: "UUID of the link to edit (required)",
  }),
  title: Schema.UndefinedOr(Schema.String).annotations({
    description: "Link title",
  }),
  description: Schema.UndefinedOr(Schema.String).annotations({
    description: "Link description",
  }),
  url: Schema.UndefinedOr(URL).annotations({
    description: "Link URL",
  }),
  status: Schema.UndefinedOr(
    Schema.Union(
      Schema.Literal("DRAFT"),
      Schema.Literal("APPROVED"),
      Schema.Literal("UNAPPROVED"),
    ),
  ).annotations({
    description: 'Link status: "DRAFT" | "APPROVED" | "UNAPPROVED"',
  }),
  publishDate: Schema.UndefinedOr(Schema.String).annotations({
    description: "Publication date YYYY-MM-DD",
  }),
  events: Schema.UndefinedOr(Schema.String).annotations({
    description: "Comma-separated event UUIDs to associate",
  }),
  keywords: Schema.UndefinedOr(Schema.String).annotations({
    description: "Comma-separated keyword UUIDs",
  }),
});

export type EditLinkInputSchema = typeof EditLinkInputSchema.Type;
