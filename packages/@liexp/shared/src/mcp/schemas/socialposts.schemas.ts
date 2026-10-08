import { Schema } from "effect";
import {
  SocialPostStatus,
  SocialPostResourceType,
  SocialPlatform,
} from "@liexp/io/lib/http/SocialPost.js";
import { UUID } from "@liexp/io/lib/http/Common/UUID.js";

export const FindSocialPostsInputSchema = Schema.Struct({
  q: Schema.UndefinedOr(Schema.String).annotations({
    description: "Search query (partial match on title)",
  }),
  status: Schema.UndefinedOr(SocialPostStatus).annotations({
    description: "Filter by status: TO_PUBLISH or PUBLISHED",
  }),
  type: Schema.UndefinedOr(SocialPostResourceType).annotations({
    description: "Resource type filter (actors, groups, keywords, etc.)",
  }),
  entity: Schema.UndefinedOr(UUID).annotations({
    description: "Filter by entity UUID",
  }),
  sort: Schema.Union(
    Schema.Literal("createdAt"),
    Schema.Literal("updatedAt"),
    Schema.Literal("scheduledAt"),
    Schema.Undefined,
  ).annotations({
    description: 'Sort field: "createdAt", "updatedAt", or "scheduledAt"',
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
export type FindSocialPostsInputSchema = typeof FindSocialPostsInputSchema.Type;

export const GetSocialPostInputSchema = Schema.Struct({
  id: UUID.annotations({
    description: "UUID of the social post to retrieve",
  }),
});
export type GetSocialPostInputSchema = typeof GetSocialPostInputSchema.Type;

export const CreateSocialPostInputSchema = Schema.Struct({
  title: Schema.String.annotations({
    description: "Title of the social post (required)",
  }),
  url: Schema.UndefinedOr(Schema.String).annotations({
    description: "Source URL of the social post",
  }),
  date: Schema.String.annotations({
    description: "Date of the social post in ISO format YYYY-MM-DD (required)",
  }),
  content: Schema.UndefinedOr(Schema.String).annotations({
    description: "Content/body text of the post",
  }),
  useReply: Schema.Boolean.annotations({
    description: "Whether this is a reply to another post",
  }),
  mediaIds: Schema.Array(UUID).annotations({
    description: "Array of media UUIDs attached to the post",
  }),
  actorIds: Schema.Array(UUID).annotations({
    description: "Array of actor UUIDs associated with the post",
  }),
  groupIds: Schema.Array(UUID).annotations({
    description: "Array of group UUIDs associated with the post",
  }),
  keywordIds: Schema.Array(UUID).annotations({
    description: "Array of keyword UUIDs associated with the post",
  }),
  platformIds: Schema.Array(SocialPlatform).annotations({
    description: "Platforms to publish to: IG or TG",
  }),
});
export type CreateSocialPostInputSchema = typeof CreateSocialPostInputSchema.Type;

export const EditSocialPostInputSchema = Schema.Struct({
  id: UUID.annotations({
    description: "UUID of the social post to edit",
  }),
  title: Schema.UndefinedOr(Schema.String).annotations({
    description: "Title or null to keep current",
  }),
  url: Schema.UndefinedOr(Schema.String).annotations({
    description: "Source URL or null to keep current",
  }),
  date: Schema.UndefinedOr(Schema.String).annotations({
    description: "Date in ISO format or null to keep current",
  }),
  content: Schema.UndefinedOr(Schema.String).annotations({
    description: "Content or null to keep current",
  }),
  useReply: Schema.UndefinedOr(Schema.Boolean).annotations({
    description: "Reply flag or null to keep current",
  }),
  mediaIds: Schema.UndefinedOr(Schema.Array(UUID)).annotations({
    description: "Array of media UUIDs or null to keep current",
  }),
  actorIds: Schema.UndefinedOr(Schema.Array(UUID)).annotations({
    description: "Array of actor UUIDs or null to keep current",
  }),
  groupIds: Schema.UndefinedOr(Schema.Array(UUID)).annotations({
    description: "Array of group UUIDs or null to keep current",
  }),
  keywordIds: Schema.UndefinedOr(Schema.Array(UUID)).annotations({
    description: "Array of keyword UUIDs or null to keep current",
  }),
  platformIds: Schema.UndefinedOr(Schema.Array(SocialPlatform)).annotations({
    description: "Platforms or null to keep current",
  }),
});
export type EditSocialPostInputSchema = typeof EditSocialPostInputSchema.Type;
