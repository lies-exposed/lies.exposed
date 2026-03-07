import { UUID } from "@liexp/io/lib/http/Common/UUID.js";
import { Schema } from "effect";

export const FindActorsInputSchema = Schema.Struct({
  fullName: Schema.UndefinedOr(Schema.String).annotations({
    description: "Full name to search for (partial match supported)",
  }),
  memberIn: Schema.Array(UUID).annotations({
    description: "Array of group UUIDs the actor is a member of",
  }),
  withDeleted: Schema.UndefinedOr(Schema.Boolean).annotations({
    description: "Include deleted actors in the search results",
  }),
  sort: Schema.Union(
    Schema.Literal("username"),
    Schema.Literal("createdAt"),
    Schema.Literal("updatedAt"),
    Schema.Undefined,
  ).annotations({
    description:
      'Sort field: "createdAt", "fullName", or "username". Defaults to createdAt',
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
export type FindActorsInputSchema = typeof FindActorsInputSchema.Type;

export const GetActorInputSchema = Schema.Struct({
  id: UUID.annotations({
    description: "UUID of the actor to retrieve",
  }),
});
export type GetActorInputSchema = typeof GetActorInputSchema.Type;

export const CreateActorInputSchema = Schema.Struct({
  username: Schema.String.annotations({
    description: "Unique username for the actor (required)",
  }),
  fullName: Schema.String.annotations({
    description: "Full name of the actor (required)",
  }),
  color: Schema.optional(Schema.String).annotations({
    description: "Hex color without # (default: random)",
  }),
  excerpt: Schema.optional(Schema.String).annotations({
    description: "Short description (default: null)",
  }),
  nationalityIds: Schema.optional(Schema.Array(UUID)).annotations({
    description: "Array of nationality UUIDs (default: [])",
  }),
  body: Schema.optional(Schema.String).annotations({
    description: "Full body content as plain text (default: null)",
  }),
  avatar: Schema.optional(UUID).annotations({
    description: "Avatar media UUID (default: null)",
  }),
  bornOn: Schema.optional(Schema.String).annotations({
    description: "Birth date in ISO format YYYY-MM-DD (default: null)",
  }),
  diedOn: Schema.optional(Schema.String).annotations({
    description: "Death date in ISO format YYYY-MM-DD (default: null)",
  }),
});
export type CreateActorInputSchema = typeof CreateActorInputSchema.Type;

export const EditActorInputSchema = Schema.Struct({
  id: UUID.annotations({
    description: "UUID of the actor to edit",
  }),
  username: Schema.UndefinedOr(Schema.String).annotations({
    description: "Unique username for the actor or null to keep current",
  }),
  fullName: Schema.UndefinedOr(Schema.String).annotations({
    description: "Full name of the actor or null to keep current",
  }),
  color: Schema.UndefinedOr(Schema.String).annotations({
    description:
      "Color associated with the actor (hex format, without #) or null to keep current",
  }),
  excerpt: Schema.UndefinedOr(Schema.String).annotations({
    description:
      "Short description of the actor as plain text or null to keep current",
  }),
  nationalities: Schema.UndefinedOr(Schema.Array(UUID)).annotations({
    description: "Array of nationality UUIDs or undefined to keep current",
  }),
  body: Schema.UndefinedOr(Schema.String).annotations({
    description: "Full body content as plain text or null to keep current",
  }),
  avatar: Schema.UndefinedOr(UUID).annotations({
    description: "Avatar media UUID or null to keep current",
  }),
  bornOn: Schema.UndefinedOr(Schema.String).annotations({
    description:
      "Birth date in ISO format (YYYY-MM-DD) or null to keep current",
  }),
  diedOn: Schema.UndefinedOr(Schema.String).annotations({
    description:
      "Death date in ISO format (YYYY-MM-DD) or undefined to keep current",
  }),
  memberIn: Schema.UndefinedOr(Schema.Array(UUID)).annotations({
    description:
      "Array of group memberships as UUIDs or undefined to keep current",
  }),
});
export type EditActorInputSchema = typeof EditActorInputSchema.Type;
