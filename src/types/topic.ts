import * as t from "io-ts"

export const TopicFileNode = t.interface(
  {
    relativeDirectory: t.string,
    childMarkdownRemark: t.interface({
      id: t.string,
      frontmatter: t.interface({
        title: t.string,
        slug: t.string,
      }),
    }),
  },
  "TopicFileNode"
)

export type TopicFileNode = t.TypeOf<typeof TopicFileNode>

export const TopicData = t.interface(
  {
    id: t.string,
    label: t.string,
    slug: t.string,
    color: t.string,
    selected: t.boolean
  },
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
