import { Schema } from "effect";

export const FindStoriesInputSchema = Schema.Struct({
  query: Schema.UndefinedOr(Schema.String).annotations({
    description: "Full-text search query to filter stories by title or body",
  }),
  draft: Schema.UndefinedOr(Schema.BooleanFromString).annotations({
    description: "Filter by draft status",
  }),
  creator: Schema.UndefinedOr(Schema.String).annotations({
    description: "Filter by creator UUID",
  }),
  start: Schema.UndefinedOr(Schema.NumberFromString).annotations({
    description: "Pagination offset (default: 0)",
  }),
  end: Schema.UndefinedOr(Schema.NumberFromString).annotations({
    description: "Pagination limit (default: 20)",
  }),
});

export const GetStoryInputSchema = Schema.Struct({
  id: Schema.String.annotations({
    description: "UUID of the story to retrieve",
  }),
});

export const CreateStoryInputSchema = Schema.Struct({
  title: Schema.String.annotations({
    description: "Story title (required)",
  }),
  path: Schema.String.annotations({
    description: "URL-friendly path slug (required)",
  }),
  date: Schema.String.annotations({
    description: "Publication date YYYY-MM-DD (required)",
  }),
  draft: Schema.UndefinedOr(Schema.BooleanFromString).annotations({
    description: "Draft status (default: true)",
  }),
  creator: Schema.UndefinedOr(Schema.String).annotations({
    description: "Creator actor UUID",
  }),
  featuredImage: Schema.UndefinedOr(Schema.String).annotations({
    description: "Featured image media UUID",
  }),
  keywords: Schema.UndefinedOr(Schema.String).annotations({
    description: "Comma-separated keyword UUIDs",
  }),
  actors: Schema.UndefinedOr(Schema.String).annotations({
    description: "Comma-separated actor UUIDs",
  }),
  groups: Schema.UndefinedOr(Schema.String).annotations({
    description: "Comma-separated group UUIDs",
  }),
  events: Schema.UndefinedOr(Schema.String).annotations({
    description: "Comma-separated event UUIDs",
  }),
  media: Schema.UndefinedOr(Schema.String).annotations({
    description: "Comma-separated media UUIDs",
  }),
});

export const EditStoryInputSchema = Schema.Struct({
  id: Schema.String.annotations({
    description: "UUID of the story to edit (required)",
  }),
  title: Schema.UndefinedOr(Schema.String).annotations({
    description: "Story title",
  }),
  path: Schema.UndefinedOr(Schema.String).annotations({
    description: "URL-friendly path slug",
  }),
  date: Schema.UndefinedOr(Schema.String).annotations({
    description: "Publication date YYYY-MM-DD",
  }),
  draft: Schema.UndefinedOr(Schema.BooleanFromString).annotations({
    description: "Draft status",
  }),
  creator: Schema.UndefinedOr(Schema.String).annotations({
    description: "Creator actor UUID",
  }),
  featuredImage: Schema.UndefinedOr(Schema.String).annotations({
    description: "Featured image media UUID",
  }),
  keywords: Schema.UndefinedOr(Schema.String).annotations({
    description: "Comma-separated keyword UUIDs",
  }),
  links: Schema.UndefinedOr(Schema.String).annotations({
    description: "Comma-separated link UUIDs",
  }),
  actors: Schema.UndefinedOr(Schema.String).annotations({
    description: "Comma-separated actor UUIDs",
  }),
  groups: Schema.UndefinedOr(Schema.String).annotations({
    description: "Comma-separated group UUIDs",
  }),
  events: Schema.UndefinedOr(Schema.String).annotations({
    description: "Comma-separated event UUIDs",
  }),
  media: Schema.UndefinedOr(Schema.String).annotations({
    description: "Comma-separated media UUIDs",
  }),
});
