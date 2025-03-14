import { Schema } from "effect";
import { ACTORS, Actor } from "./Actor.js";
import { AREAS } from "./Area.js";
import { UUID } from "./Common/index.js";
import { EVENTS } from "./Events/index.js";
import { GROUPS, Group } from "./Group.js";
import { KEYWORDS, Keyword } from "./Keyword.js";
import { LINKS } from "./Link.js";
import { MEDIA } from "./Media/Media.js";
import { GetListQuery } from "./Query/index.js";
import { OptionFromNullishToNull } from './Common/OptionFromNullishToNull.js';

export const SocialPostPhoto = Schema.Struct({
  type: Schema.Literal("photo"),
  media: Schema.String,
  thumbnail: Schema.String,
}).annotations({
  title: "SocialPostPhoto",
});
export type SocialPostPhoto = typeof SocialPostPhoto.Type;

export const SocialPostDocument = Schema.Struct({
  type: Schema.Literal("document"),
  filename: Schema.String,
  media: Schema.String,
  thumbnail: Schema.String,
}).annotations({
  title: "SocialPostDocument",
});
export type SocialPostDocument = typeof SocialPostDocument.Type;

export const SocialPostVideo = Schema.Struct({
  type: Schema.Literal("video"),
  media: Schema.String,
  thumbnail: Schema.String,
  duration: Schema.Union(Schema.Number, Schema.Undefined),
}).annotations({
  title: "SocialPostVideo",
});
export type SocialPostVideo = typeof SocialPostVideo.Type;

export const SocialPostBodyMultipleMedia = Schema.Array(
  Schema.Union(SocialPostPhoto, SocialPostVideo, SocialPostDocument),
).annotations({
  title: "SocialPostBodyMultipleMedia",
});
export type SocialPostBodyMultipleMedia =
  typeof SocialPostBodyMultipleMedia.Type;
export const IGPlatform = Schema.Literal("IG");
export type IGPlatform = typeof IGPlatform.Type;

export const TGPlatform = Schema.Literal("TG");
export type TGPlatform = typeof TGPlatform.Type;

export const SocialPlatform = Schema.Union(IGPlatform, TGPlatform).annotations({
  title: "SharePlatform",
});
export type SocialPlatform = typeof SocialPlatform.Type;

export const SocialPostResourceType = Schema.Union(
  ACTORS,
  GROUPS,
  KEYWORDS,
  MEDIA,
  EVENTS,
  LINKS,
  AREAS,
  Schema.Literal("stories"),
).annotations({
  title: "SocialPostResourceType",
});

export type SocialPostResourceType = typeof SocialPostResourceType.Type;

export const TO_PUBLISH = Schema.Literal("TO_PUBLISH");
export type TO_PUBLISH = typeof TO_PUBLISH.Type;
export const PUBLISHED = Schema.Literal("PUBLISHED");
export type PUBLISHED = typeof PUBLISHED.Type;
export const SocialPostStatus = Schema.Union(TO_PUBLISH, PUBLISHED).annotations(
  {
    title: "SocialPostStatus",
  },
);

export type SocialPostStatus = typeof SocialPostStatus;

export const GetListSocialPostQuery = Schema.Struct({
  ...GetListQuery.fields,
  distinct: OptionFromNullishToNull(Schema.BooleanFromString),
  scheduleAt: OptionFromNullishToNull(Schema.DateFromString),
  type: OptionFromNullishToNull(SocialPostResourceType),
  status: OptionFromNullishToNull(SocialPostStatus),
  entity: OptionFromNullishToNull(UUID),
}).annotations({
  title: "GetListSocialPostQuery",
});

export const CreateSocialPost = Schema.Struct({
  title: Schema.String,
  url: Schema.String,
  date: Schema.String,
  content: Schema.Union(Schema.String, Schema.Undefined),
  useReply: Schema.Boolean,
  media: SocialPostBodyMultipleMedia,
  actors: Schema.Array(Actor),
  groups: Schema.Array(Group),
  keywords: Schema.Array(Keyword),
  platforms: Schema.Record({ key: SocialPlatform, value: Schema.Boolean }),
  schedule: Schema.Union(Schema.Number, Schema.Undefined),
}).annotations({
  title: "CreateSocialPost",
});
export type CreateSocialPost = typeof CreateSocialPost.Type;

export const SocialPostPublishResult = Schema.Struct({
  tg: Schema.Any,
  ig: Schema.Any,
}).annotations({
  title: "SocialPostPublishResult",
});
export type SocialPostPublishResult = typeof SocialPostPublishResult.Type;

export const SocialPost = Schema.Struct({
  ...CreateSocialPost.fields,
  type: SocialPostResourceType,
  entity: UUID,
  publishCount: Schema.Number,
  status: SocialPostStatus,
  result: SocialPostPublishResult,
  scheduledAt: Schema.DateFromString,
}).annotations({
  title: "ShareMessageBody",
});
export type SocialPost = typeof SocialPost.Type;

export const EditSocialPost = Schema.Struct({
  ...SocialPost.fields,
  keywords: Schema.Array(UUID),
  groups: Schema.Array(UUID),
  actors: Schema.Array(UUID),
}).annotations({
  title: "EditSocialPost",
});
export type EditSocialPost = typeof EditSocialPost.Type;
