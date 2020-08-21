import * as t from "io-ts"
import { DateFromISOString } from "io-ts-types/lib/DateFromISOString"
import { date } from "io-ts-types/lib/date"
import { option } from "io-ts-types/lib/option"
import { optionFromNullable } from "io-ts-types/lib/optionFromNullable"
import { ActorFrontmatter } from "./actor"
import { GroupFrontmatter } from "./group"
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

export const EventFrontmatter = t.strict(
  {
    uuid: t.string,
    title: t.string,
    date: DateFromISOString,
    topics: t.array(t.string),
    actors: optionFromNullable(t.array(t.string)),
    groups: optionFromNullable(t.array(t.string)),
    type: optionFromNullable(EventType),
    cover: optionFromNullable(t.string),
    links: optionFromNullable(t.array(t.string)),
  },
  "EventFrontmatter"
)

export type EventFrontmatter = t.TypeOf<typeof EventFrontmatter>

export const EventMarkdownRemark = t.interface(
  {
    frontmatter: EventFrontmatter,
    fields: t.interface({
      actors: optionFromNullable(t.array(ActorFrontmatter)),
      groups: optionFromNullable(t.array(GroupFrontmatter)),
      topics: optionFromNullable(t.array(TopicFrontmatter)),
    }),
    htmlAst: t.object,
  },
  "EventMarkdownRemark"
)

export type EventMarkdownRemark = t.TypeOf<typeof EventMarkdownRemark>

export const EventData = t.interface(
  {
    frontmatter: t.strict(
      {
        uuid: t.string,
        title: t.string,
        date: date,
        actors: option(t.array(ActorFrontmatter)),
        groups: option(t.array(GroupFrontmatter)),
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
