import * as t from "io-ts"
import { optionFromNullable } from "io-ts-types/lib/optionFromNullable"
import { Frontmatter } from "./Frontmatter"
import { ImageFileNode } from "./Image"
import { mdx } from "./Mdx"

export const ArticleFrontmatter = t.strict(
  {
    ...Frontmatter.props,
    title: t.string,
    path: t.string,
    draft: t.boolean,
    featuredImage: ImageFileNode,
    links: optionFromNullable(t.array(t.string)),
  },
  "ArticleFrontmatter"
)

export type ArticleFrontmatter = t.TypeOf<typeof ArticleFrontmatter>

export const ArticleMD = mdx(ArticleFrontmatter, 'ArticleMD')

export type ArticleMD = t.TypeOf<typeof ArticleMD>
