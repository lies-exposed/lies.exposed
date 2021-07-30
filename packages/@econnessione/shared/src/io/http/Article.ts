import * as t from "io-ts";
import { DateFromISOString } from "io-ts-types";
import { BaseFrontmatter } from "./Common/BaseFrontmatter";
import { markdownRemark } from "./Common/Markdown";

export const Article = t.strict(
  {
    ...BaseFrontmatter.type.props,
    title: t.string,
    path: t.string,
    draft: t.boolean,
    date: DateFromISOString,
    featuredImage: t.string,
    links: t.array(t.string),
    body: t.string,
  },
  "Article"
);

export type Article = t.TypeOf<typeof Article>;

export const ArticleMD = markdownRemark(Article, "ArticleMD");

export type ArticleMD = t.TypeOf<typeof ArticleMD>;
