import * as t from "io-ts"
import { DateFromISOString } from "io-ts-types/lib/DateFromISOString"
import { ObjectFromString } from "./ObjectFromString"
import { PolygonIO } from "./event"
import { GroupFrontmatter } from "./group"
import { TopicFrontmatter } from "./topic"

export const AreaFrontmatter = t.strict(
  {
    uuid: t.string,
    label: t.string,
    topics: t.array(TopicFrontmatter),
    groups: t.array(GroupFrontmatter),
    color: t.string,
    date: DateFromISOString,
    polygon: ObjectFromString.pipe(PolygonIO),
  },
  "Area"
)

export type AreaFrontmatter = t.TypeOf<typeof AreaFrontmatter>

export const AreaMarkdownRemark = t.strict(
  {
    frontmatter: AreaFrontmatter,
    tableOfContents: t.string,
    htmlAst: t.any,
  },
  "AreaMarkdownRemark"
)

export type AreaMarkdownRemark = t.TypeOf<typeof AreaMarkdownRemark>
