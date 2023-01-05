import * as t from "io-ts";
import { Keyword } from './Keyword';

export const ShareMessageBody = t.strict(
  {
    title: t.string,
    date: t.string,
    content: t.string,
    media: t.string,
    url: t.string,
    keywords: t.array(Keyword),
  },
  "ShareMessageBody"
);
export type ShareMessageBody = t.TypeOf<typeof ShareMessageBody>;
