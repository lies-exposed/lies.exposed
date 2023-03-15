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

export const ShareMessageBody = t.strict(
  {
    title: t.string,
    date: t.string,
    content: t.string,
    media: t.union([t.string, ShareMessageBodyMultipleMedia]),
    url: t.string,
    keywords: t.array(Keyword),
  },
  "ShareMessageBody"
);
export type ShareMessageBody = t.TypeOf<typeof ShareMessageBody>;
