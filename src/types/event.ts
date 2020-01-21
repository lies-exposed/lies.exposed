import * as t from "io-ts"
import { DateFromISOString } from "io-ts-types/lib/DateFromISOString"
import { optionFromNullable } from "io-ts-types/lib/optionFromNullable"
import { option } from "io-ts-types/lib/option"
import { date } from "io-ts-types/lib/date"

export const Group = t.interface({
  username: t.string,
  name: t.string,
})

export const Subject = t.interface({
  tag: t.string,
})

export interface TreeEvent {
  name: string
  date: Date
  children: TreeEvent[]
}

export const TreeEvent: t.Type<TreeEvent> = t.recursion("TreeEvent", () =>
  t.type({
    name: t.string,
    date: date,
    children: t.array(TreeEvent),
  })
)
export const EventType = t.keyof(
  {
    AntiEcologicAct: null,
    EcologicAct: null,
  },
  "EventType"
)

export const EventFileNodeFrontmatter = t.interface(
  {
    icon: t.string,
    title: t.string,
    date: DateFromISOString,
    actors: optionFromNullable(t.array(t.string)),
    type: optionFromNullable(EventType),
    cover: optionFromNullable(t.string),
  },
  "EventFrontmatter"
)

export const EventFileNode = t.interface(
  {
    relativeDirectory: t.string,
    childMarkdownRemark: t.interface(
      {
        id: t.string,
        frontmatter: EventFileNodeFrontmatter,
        html: t.string,
      },
      "ChildMarkdownRemark"
    ),
  },
  "EventFileNode"
)

export type EventFileNode = t.TypeOf<typeof EventFileNode>

export const EventPointFrontmatter = t.interface(
  {
    icon: t.string,
    title: t.string,
    date: date,
    actors: option(t.array(t.string)),
    type: option(EventType),
    cover: option(t.string),
  },
  "EventFrontmatter"
)

export const EventPointData = t.interface(
  {
    id: t.string,
    frontmatter: EventFileNodeFrontmatter,
    html: t.string,
    topicLabel: t.string,
    topicFill: t.string,
    topicSlug: t.string,
    fill: t.string,
  },
  "EventPointData"
)

export type EventPointData = t.TypeOf<typeof EventPointData>

export const EventPoint = t.interface(
  {
    x: t.number,
    y: t.number,
    data: EventPointData,
  },
  "EventPoint"
)
export type EventPoint = t.TypeOf<typeof EventPoint>

