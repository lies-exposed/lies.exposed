import * as t from "io-ts"

export const TopicFileNode = t.interface(
  {
    id: t.string,
    relativeDirectory: t.string,
    childMarkdownRemark: t.interface({
      frontmatter: t.interface({
        title: t.string,
        slug: t.string,
      }),
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
