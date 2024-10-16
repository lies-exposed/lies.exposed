import * as t from "io-ts";
import { BooleanFromString } from "io-ts-types/lib/BooleanFromString.js";
import { DateFromISOString } from "io-ts-types/lib/DateFromISOString.js";
import { optionFromNullable } from "io-ts-types/lib/optionFromNullable.js";
import { ACTORS, Actor } from "./Actor.js";
import { AREAS } from "./Area.js";
import { UUID } from "./Common/index.js";
import { EVENTS } from "./Events/index.js";
import { GROUPS, Group } from "./Group.js";
import { KEYWORDS, Keyword } from "./Keyword.js";
import { LINKS } from "./Link.js";
import { MEDIA } from "./Media/Media.js";
import { GetListQuery } from "./Query/index.js";

export const SocialPostPhoto = t.type(
  {
    type: t.literal("photo"),
    media: t.string,
    thumbnail: t.string,
  },
  "SocialPostPhoto",
);
export type SocialPostPhoto = t.TypeOf<typeof SocialPostPhoto>;

export const SocialPostDocument = t.type(
  {
    type: t.literal("document"),
    filename: t.string,
    media: t.string,
    thumbnail: t.string,
  },
  "SocialPostPhoto",
);
export type SocialPostDocument = t.TypeOf<typeof SocialPostDocument>;

export const SocialPostVideo = t.type(
  {
    type: t.literal("video"),
    media: t.string,
    thumbnail: t.string,
    duration: t.union([t.number, t.undefined]),
  },
  "SocialPostVideo",
);
export type SocialPostVideo = t.TypeOf<typeof SocialPostVideo>;

export const SocialPostBodyMultipleMedia = t.array(
  t.union([SocialPostPhoto, SocialPostVideo, SocialPostDocument]),
  "SocialPostBodyMultipleMedia",
);
export type SocialPostBodyMultipleMedia = t.TypeOf<
  typeof SocialPostBodyMultipleMedia
>;
export const IGPlatform = t.literal("IG");
export type IGPlatform = t.TypeOf<typeof IGPlatform>;

export const TGPlatform = t.literal("TG");
export type TGPlatform = t.TypeOf<typeof TGPlatform>;

export const SocialPlatform = t.union(
  [IGPlatform, TGPlatform],
  "SharePlatform",
);
export type SocialPlatform = t.TypeOf<typeof SocialPlatform>;

export const SocialPostResourceType = t.union(
  [ACTORS, GROUPS, KEYWORDS, MEDIA, EVENTS, LINKS, AREAS, t.literal("stories")],
  "SocialPostResourceType",
);
export type SocialPostResourceType = t.TypeOf<typeof SocialPostResourceType>;

export const TO_PUBLISH = t.literal("TO_PUBLISH");
export type TO_PUBLISH = t.TypeOf<typeof TO_PUBLISH>;
export const PUBLISHED = t.literal("PUBLISHED");
export type PUBLISHED = t.TypeOf<typeof PUBLISHED>;
export const SocialPostStatus = t.union(
  [TO_PUBLISH, PUBLISHED],
  "SocialPostStatus",
);

export type SocialPostStatus = t.TypeOf<typeof SocialPostStatus>;

export const GetListSocialPostQuery = t.type(
  {
    ...GetListQuery.props,
    distinct: optionFromNullable(BooleanFromString),
    type: optionFromNullable(SocialPostResourceType),
    status: optionFromNullable(SocialPostStatus),
    entity: optionFromNullable(UUID),
  },
  "GetListSocialPostQuery",
);

export const CreateSocialPost = t.strict(
  {
    title: t.string,
    url: t.string,
    date: t.string,
    content: t.union([t.string, t.undefined]),
    useReply: t.boolean,
    media: SocialPostBodyMultipleMedia,
    actors: t.array(Actor),
    groups: t.array(Group),
    keywords: t.array(Keyword),
    platforms: t.record(SocialPlatform, t.boolean),
    schedule: t.union([t.number, t.undefined]),
  },
  "CreateSocialPost",
);
export type CreateSocialPost = t.TypeOf<typeof CreateSocialPost>;

export const SocialPostPublishResult = t.strict(
  {
    tg: t.any,
    ig: t.any,
  },
  "SocialPostPublishResult",
);
export type SocialPostPublishResult = t.TypeOf<typeof SocialPostPublishResult>;

export const SocialPost = t.strict(
  {
    ...CreateSocialPost.type.props,
    type: SocialPostResourceType,
    entity: UUID,
    publishCount: t.number,
    status: SocialPostStatus,
    result: SocialPostPublishResult,
    scheduledAt: DateFromISOString,
  },
  "ShareMessageBody",
);
export type SocialPost = t.TypeOf<typeof SocialPost>;

export const EditSocialPost = t.strict(
  {
    ...SocialPost.type.props,
    keywords: t.array(UUID),
    groups: t.array(UUID),
    actors: t.array(UUID),
  },
  "EditSocialPost",
);
export type EditSocialPost = t.TypeOf<typeof EditSocialPost>;
