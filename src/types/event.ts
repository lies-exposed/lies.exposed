import * as t from "io-ts"
import { DateFromISOString } from "io-ts-types/lib/DateFromISOString"
import { date } from "io-ts-types/lib/date"
import { option } from "io-ts-types/lib/option"
import { ActorFileNode } from "./actor"

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
    title: t.string,
    date: DateFromISOString,
    actors: t.union([t.null, t.undefined, t.array(t.string)]),
    type: t.union([t.null, t.undefined, EventType]),
    cover: t.union([t.null, t.undefined, t.string]),
    links: t.union([t.null, t.undefined, t.array(t.string)]),
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
        htmlAst: t.object,
      },
      "ChildMarkdownRemark"
    ),
  },
  "EventFileNode"
)

export type EventFileNode = t.TypeOf<typeof EventFileNode>

export const EventPointFrontmatter = t.interface(
  {
    title: t.string,
    date: date,
    actors: option(t.array(ActorFileNode)),
    links: option(t.array(t.string)),
    type: option(EventType),
    cover: option(t.string),
  },
  "EventFrontmatter"
)

export type EventPointFrontmatter = t.TypeOf<typeof EventPointFrontmatter>

export const EventData = t.interface(
  {
    id: t.string,
    frontmatter: EventPointFrontmatter,
    htmlAst: t.object,
    topicLabel: t.string,
    topicFill: t.string,
    topicSlug: t.string,
    fill: t.string,
  },
  "EventData"
)

export type EventData = t.TypeOf<typeof EventData>

export const EventPoint = t.interface(
  {
    x: t.number,
    y: t.number,
    data: EventData,
  },
  "EventPoint"
)
export type EventPoint = t.TypeOf<typeof EventPoint>
