import * as t from "io-ts"

export const TopicFrontmatter = t.interface(
  {
    label: t.string,
    slug: t.string,
  },
  "TopicFrontmatter"
)

export type TopicFrontmatter = t.TypeOf<typeof TopicFrontmatter>

export const TopicFileNode = t.interface(
  {
    id: t.string,
    relativeDirectory: t.string,
    childMarkdownRemark: t.interface({
      frontmatter: TopicFrontmatter,
    }),
  },
  "TopicFileNode"
)

export type TopicFileNode = t.TypeOf<typeof TopicFileNode>

export const TopicPoint = t.interface(
  {
    id: t.string,
    x: t.number,
    y: t.number,
    label: t.string,
    slug: t.string,
    color: t.string,
  },
  "TopicPoint"
)

export type TopicPoint = t.TypeOf<typeof TopicPoint>
