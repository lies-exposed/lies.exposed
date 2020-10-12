import * as t from "io-ts"
import { DateFromISOString } from "io-ts-types/lib/DateFromISOString"
import { optionFromNullable } from "io-ts-types/lib/optionFromNullable"
import { mdx } from "./Mdx"

export const TopicFrontmatter = t.type(
  {
    uuid: t.string,
    label: t.string,
    slug: t.string,
    date: DateFromISOString,
    cover: optionFromNullable(t.string),
    color: t.string,
  },
  "TopicFrontmatter"
)
export type TopicFrontmatter = t.TypeOf<typeof TopicFrontmatter>

export const TopicMD = mdx(
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
