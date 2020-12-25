import * as t from "io-ts"
import { BaseFrontmatter } from "./Common/BaseFrontmatter"
import { JSONFromString } from "./Common/JSONFromString"
import { markdownRemark } from "./Common/Markdown"
import { Polygon } from "./Common/Polygon"
import { GroupFrontmatter } from "./Group"
import { TopicFrontmatter } from "./Topic"

const AREA_FRONTMATTER = t.literal('AreaFrontmatter')

export const AreaFrontmatter = t.strict(
  {
    ...BaseFrontmatter.type.props,
    type: AREA_FRONTMATTER,
    label: t.string,
    topics: t.array(TopicFrontmatter),
    groups: t.array(GroupFrontmatter),
    color: t.string,
    polygon: JSONFromString.pipe(Polygon),
  },
  "AreaFrontmatter"
)

export type AreaFrontmatter = t.TypeOf<typeof AreaFrontmatter>

export const AreaMD = markdownRemark(AreaFrontmatter, 'AreaFrontmatter')

export type AreaMD = t.TypeOf<typeof AreaMD>
