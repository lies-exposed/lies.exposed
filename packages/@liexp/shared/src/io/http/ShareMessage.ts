import * as t from "io-ts";
import { Keyword } from "./Keyword";

export const ShareMessageBodyMultipleMedia = t.array(
  t.type({
    type: t.union([t.literal("photo"), t.literal("video")]),
    media: t.string,
  }),
  "ShareMessageBodyMultipleMedia"
);
export type ShareMessageBodyMultipleMedia = t.TypeOf<
  typeof ShareMessageBodyMultipleMedia
>;
export const IGPlatform = t.literal("IG");
export type IGPlatform = t.TypeOf<typeof IGPlatform>;

export const TGPlatform = t.literal("TG");
export type TGPlatform = t.TypeOf<typeof TGPlatform>;

export const SharePlatform = t.union([IGPlatform, TGPlatform], "SharePlatform");
export type SharePlatform = t.TypeOf<typeof SharePlatform>;

export const ShareMessageBody = t.strict(
  {
    title: t.string,
    date: t.string,
    content: t.string,
    media: t.union([t.string, ShareMessageBodyMultipleMedia]),
    url: t.string,
    keywords: t.array(Keyword),
    platforms: t.record(SharePlatform, t.boolean)
  },
  "ShareMessageBody"
);
export type ShareMessageBody = t.TypeOf<typeof ShareMessageBody>;