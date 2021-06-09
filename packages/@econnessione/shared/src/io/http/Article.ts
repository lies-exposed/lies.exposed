import * as t from "io-ts";
import { BaseFrontmatter } from "./Common/BaseFrontmatter";
import { markdownRemark } from "./Common/Markdown";

const ARTICLE_FRONTMATTER = "Article";
export const Article = t.strict(
  {
    ...BaseFrontmatter.type.props,
    type: t.literal(ARTICLE_FRONTMATTER),
    title: t.string,
    path: t.string,
    draft: t.boolean,
    featuredImage: t.string,
    links: t.array(t.string),
    body: t.string,
  },
  "Article"
);

export type Article = t.TypeOf<typeof Article>;

export const ArticleMD = markdownRemark(Article, "ArticleMD");

export type ArticleMD = t.TypeOf<typeof ArticleMD>;
