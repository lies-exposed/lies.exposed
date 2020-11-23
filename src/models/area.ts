import * as t from "io-ts"
import { JSONFromString } from "./Common/JSONFromString"
import { Polygon } from "./Common/Polygon"
import { BaseFrontmatter } from "./Frontmatter"
import { markdownRemark } from "./Markdown"
import { GroupFrontmatter } from "./group"
import { TopicFrontmatter } from "./topic"

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
