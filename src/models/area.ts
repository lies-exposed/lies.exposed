import * as t from "io-ts"
import { Polygon } from "./Common/Polygon"
import { Frontmatter } from "./Frontmatter"
import { JSONFromString } from "./JSONFromString"
import { markdownRemark } from "./Markdown"
import { GroupFrontmatter } from "./group"
import { TopicFrontmatter } from "./topic"

export const AreaFrontmatter = t.strict(
  {
    ...Frontmatter.props,
    label: t.string,
    topics: t.array(TopicFrontmatter),
    groups: t.array(GroupFrontmatter),
    color: t.string,
    polygon: JSONFromString.pipe(Polygon),
  },
  "Area"
)

export type AreaFrontmatter = t.TypeOf<typeof AreaFrontmatter>

export const AreaMD = markdownRemark(AreaFrontmatter, 'AreaFrontmatter')

export type AreaMD = t.TypeOf<typeof AreaMD>
