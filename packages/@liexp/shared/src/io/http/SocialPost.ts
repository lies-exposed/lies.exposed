import * as t from "io-ts";
import { DateFromISOString } from "io-ts-types/lib/DateFromISOString";
import { ACTORS, Actor } from "./Actor";
import { EVENTS } from "./Events";
import { GROUPS, Group } from "./Group";
import { KEYWORDS, Keyword } from "./Keyword";
import { MEDIA } from "./Media";

export const SocialPostBodyMultipleMedia = t.array(
  t.type({
    type: t.union([t.literal("photo"), t.literal("video")]),
    media: t.string,
  }),
  "SocialPostBodyMultipleMedia"
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
  "SharePlatform"
);
export type SocialPlatform = t.TypeOf<typeof SocialPlatform>;

export const SocialPostResourceType = t.union(
  [ACTORS, GROUPS, KEYWORDS, MEDIA, EVENTS],
  "SocialPostResourceType"
);
export type SocialPostResourceType = t.TypeOf<
  typeof SocialPostResourceType
>;

export const TO_PUBLISH = t.literal("TO_PUBLISH");
export type TO_PUBLISH = t.TypeOf<typeof TO_PUBLISH>;
export const PUBLISHED = t.literal("PUBLISHED");
export type PUBLISHED = t.TypeOf<typeof PUBLISHED>;
export const SocialPostStatus = t.union(
  [TO_PUBLISH, PUBLISHED],
  "SocialPostStatus"
);

export type SocialPostStatus = t.TypeOf<typeof SocialPostStatus>;

export const CreateSocialPost = t.strict(
  {
    title: t.string,
    url: t.string,
    date: t.string,
    content: t.string,
    media: t.union([t.string, SocialPostBodyMultipleMedia]),
    actors: t.array(Actor),
    groups: t.array(Group),
    keywords: t.array(Keyword),
    platforms: t.record(SocialPlatform, t.boolean),
    schedule: t.union([t.number, t.undefined]),
  },
  "CreateSocialPost"
);
export type CreateSocialPost = t.TypeOf<typeof CreateSocialPost>;

export const SocialPost = t.strict(
  {
    ...CreateSocialPost.type.props,
    status: SocialPostStatus,
    scheduledAt: DateFromISOString,
  },
  "ShareMessageBody"
);
export type SocialPost = t.TypeOf<typeof SocialPost>;
