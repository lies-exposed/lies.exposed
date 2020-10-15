import * as t from "io-ts"
import { DateFromISOString } from "io-ts-types/lib/DateFromISOString"
import { Polygon } from "./Common/Polygon"
import { mdx } from "./Mdx"
import { JSONFromString } from "./JSONFromString"
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
    polygon: JSONFromString.pipe(Polygon),
  },
  "Area"
)

export type AreaFrontmatter = t.TypeOf<typeof AreaFrontmatter>

export const AreaMD = mdx(AreaFrontmatter, 'AreaFrontmatter')

export type AreaMD = t.TypeOf<typeof AreaMD>
