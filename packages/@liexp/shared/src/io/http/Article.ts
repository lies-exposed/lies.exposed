import * as t from "io-ts";
import { DateFromISOString } from "io-ts-types/DateFromISOString";
import { UUID } from 'io-ts-types/UUID';
import { BaseProps } from "./Common/BaseProps";
import { markdownRemark } from "./Common/Markdown";
import { Media } from './Media';

export const Article = t.strict(
  {
    ...BaseProps.type.props,
    title: t.string,
    path: t.string,
    draft: t.boolean,
    creator: t.union([UUID, t.undefined]),
    date: DateFromISOString,
    featuredImage: t.union([Media, t.undefined]),
    links: t.array(t.string),
    body: t.string,
    body2: t.union([t.unknown, t.null]),
  },
  "Article"
);

export type Article = t.TypeOf<typeof Article>;

export const ArticleMD = markdownRemark(Article, "ArticleMD");

export type ArticleMD = t.TypeOf<typeof ArticleMD>;
