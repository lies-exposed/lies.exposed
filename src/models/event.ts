import * as t from "io-ts"
import { DateFromISOString } from "io-ts-types/lib/DateFromISOString"
import { date } from "io-ts-types/lib/date"
import { option } from "io-ts-types/lib/option"
import { optionFromNullable } from "io-ts-types/lib/optionFromNullable"
import { ActorFrontmatter } from "./actor"
import { TopicFrontmatter } from "./topic"

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
    Declaration: null,
    Fact: null,
  },
  "EventType"
)

export const EventFileNodeFrontmatter = t.strict(
  {
    uuid: t.string,
    title: t.string,
    date: DateFromISOString,
    topic: t.array(t.string),
    actors: optionFromNullable(t.array(t.string)),
    groups: optionFromNullable(t.array(t.string)),
    type: optionFromNullable(EventType),
    cover: optionFromNullable(t.string),
    links: optionFromNullable(t.array(t.string)),
  },
  "EventFrontmatter"
)

export const EventFileNode = t.strict(
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

export const EventData = t.interface(
  {
    id: t.string,
    frontmatter: t.strict(
      {
        uuid: t.string,
        title: t.string,
        date: date,
        actors: option(t.array(ActorFrontmatter)),
        topic: t.array(TopicFrontmatter),
        links: option(t.array(t.string)),
        type: option(EventType),
        cover: option(t.string),
      },
      "EventFrontmatter"
    ),
    htmlAst: t.object,
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
