import * as t from "io-ts"
import { Color } from "./Common/Color"
import { Frontmatter } from "./Frontmatter"
import { markdownRemark } from "./Markdown"

export const TopicFrontmatter = t.strict(
  {
    ...Frontmatter.props,
    label: t.string,
    slug: t.string,
    color: Color,
  },
  "TopicFrontmatter"
)
export type TopicFrontmatter = t.TypeOf<typeof TopicFrontmatter>

export const TopicMD = markdownRemark(
  TopicFrontmatter,
  "TopicMD"
)

export type TopicMD = t.TypeOf<typeof TopicMD>

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
