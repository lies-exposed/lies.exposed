import { UUID } from "@liexp/io/lib/http/Common/UUID.js";
import { Schema } from "effect";

export const FindGroupsInputSchema = Schema.Struct({
  query: Schema.UndefinedOr(Schema.String).annotations({
    description: "Search query string to filter groups by name",
  }),
  sort: Schema.UndefinedOr(
    Schema.Union(Schema.Literal("createdAt"), Schema.Literal("name")),
  ).annotations({
    description: 'Sort field: "createdAt" or "name"',
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

export const GetGroupInputSchema = Schema.Struct({
  id: UUID.annotations({
    description: "UUID of the group to retrieve",
  }),
});

export const CreateGroupInputSchema = Schema.Struct({
  name: Schema.String.annotations({
    description: "Name of the group (required)",
  }),
  username: Schema.String.annotations({
    description: "Unique username/slug for the group (required)",
  }),
  kind: Schema.Union(
    Schema.Literal("Public"),
    Schema.Literal("Private"),
  ).annotations({
    description: 'Whether the group is "Public" or "Private" (required)',
  }),
  color: Schema.UndefinedOr(Schema.String).annotations({
    description: "Hex color without # (default: random)",
  }),
  excerpt: Schema.UndefinedOr(Schema.String).annotations({
    description: "Short description",
  }),
  avatar: Schema.UndefinedOr(UUID).annotations({
    description: "Avatar media UUID",
  }),
  startDate: Schema.UndefinedOr(Schema.DateFromString).annotations({
    description: "Start date YYYY-MM-DD",
  }),
  endDate: Schema.UndefinedOr(Schema.DateFromString).annotations({
    description: "End date YYYY-MM-DD",
  }),
});

export const EditGroupInputSchema = Schema.Struct({
  id: UUID.annotations({
    description: "UUID of the group to edit (required)",
  }),
  name: Schema.UndefinedOr(Schema.String),
  username: Schema.UndefinedOr(Schema.String),
  kind: Schema.UndefinedOr(
    Schema.Union(Schema.Literal("Public"), Schema.Literal("Private")),
  ),
  color: Schema.UndefinedOr(Schema.String),
  excerpt: Schema.UndefinedOr(Schema.String),
  avatar: Schema.UndefinedOr(Schema.String),
  startDate: Schema.UndefinedOr(Schema.DateFromString),
  endDate: Schema.UndefinedOr(Schema.DateFromString),
  members: Schema.UndefinedOr(Schema.Array(Schema.String)).annotations({
    description: "Array of actor UUIDs",
  }),
});
