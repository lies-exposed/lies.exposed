import { UUID } from "@liexp/io/lib/http/Common/UUID.js";
import { Schema } from "effect";

export const FindStoriesInputSchema = Schema.Struct({
  query: Schema.UndefinedOr(Schema.String).annotations({
    description: "Full-text search query to filter stories by title or body",
  }),
  draft: Schema.UndefinedOr(Schema.BooleanFromString).annotations({
    description: "Filter by draft status",
  }),
  creator: Schema.UndefinedOr(UUID).annotations({
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
  id: UUID.annotations({
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
  creator: Schema.UndefinedOr(UUID).annotations({
    description: "Creator actor UUID",
  }),
  featuredImage: Schema.UndefinedOr(UUID).annotations({
    description: "Featured image media UUID",
  }),
  keywords: Schema.UndefinedOr(Schema.Array(UUID)).annotations({
    description:
      "Keyword UUIDs to associate (comma-separated when passed as CLI arg)",
  }),
  actors: Schema.UndefinedOr(Schema.Array(UUID)).annotations({
    description:
      "Actor UUIDs to associate (comma-separated when passed as CLI arg)",
  }),
  groups: Schema.UndefinedOr(Schema.Array(UUID)).annotations({
    description:
      "Group UUIDs to associate (comma-separated when passed as CLI arg)",
  }),
  events: Schema.UndefinedOr(Schema.Array(UUID)).annotations({
    description:
      "Event UUIDs to associate (comma-separated when passed as CLI arg)",
  }),
  media: Schema.UndefinedOr(Schema.Array(UUID)).annotations({
    description:
      "Media UUIDs to associate (comma-separated when passed as CLI arg)",
  }),
});

export const EditStoryInputSchema = Schema.Struct({
  id: UUID.annotations({
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
  keywords: Schema.UndefinedOr(Schema.Array(Schema.String)).annotations({
    description:
      "Keyword UUIDs to associate (comma-separated when passed as CLI arg)",
  }),
  links: Schema.UndefinedOr(Schema.Array(UUID)).annotations({
    description:
      "Link UUIDs to associate (comma-separated when passed as CLI arg)",
  }),
  actors: Schema.UndefinedOr(Schema.Array(UUID)).annotations({
    description:
      "Actor UUIDs to associate (comma-separated when passed as CLI arg)",
  }),
  groups: Schema.UndefinedOr(Schema.Array(UUID)).annotations({
    description:
      "Group UUIDs to associate (comma-separated when passed as CLI arg)",
  }),
  events: Schema.UndefinedOr(Schema.Array(UUID)).annotations({
    description:
      "Event UUIDs to associate (comma-separated when passed as CLI arg)",
  }),
  media: Schema.UndefinedOr(Schema.Array(UUID)).annotations({
    description:
      "Media UUIDs to associate (comma-separated when passed as CLI arg)",
  }),
});
