import * as t from "io-ts"
import { optionFromNullable } from "io-ts-types/lib/optionFromNullable"

export const TopicFrontmatter = t.type(
  {
    label: t.string,
    slug: t.string,
    cover: optionFromNullable(t.string),
    color: t.string,
  },
  "TopicFrontmatter"
)
export type TopicFrontmatter = t.TypeOf<typeof TopicFrontmatter>

export const TopicFileNode = t.interface(
  {
    relativeDirectory: t.string,
    childMarkdownRemark: t.interface({
      frontmatter: TopicFrontmatter,
    }),
  },
  "TopicFileNode"
)

export type TopicFileNode = t.TypeOf<typeof TopicFileNode>

export const TopicData = t.intersection(
  [
    TopicFrontmatter,
    t.interface({
      selected: t.boolean,
    }),
  ],
  "TopicData"
)

export type TopicData = t.TypeOf<typeof TopicData>

export const TopicPoint = t.interface(
  {
    x: t.number,
    y: t.number,
    data: TopicData,
  },
  "TopicPoint"
)

export type TopicPoint = t.TypeOf<typeof TopicPoint>
