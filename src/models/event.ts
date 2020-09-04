import * as t from "io-ts"
import { DateFromISOString } from "io-ts-types/lib/DateFromISOString"
import { date } from "io-ts-types/lib/date"
import { nonEmptyArray } from "io-ts-types/lib/nonEmptyArray"
import { optionFromNullable } from "io-ts-types/lib/optionFromNullable"
import { ObjectFromString } from "./ObjectFromString"
import { ActorFrontmatter } from "./actor"
import { GroupFrontmatter } from "./group"
import { ImageFileNode } from "./image"
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

export const EventTypeKeys = {
  // old types
  AntiEcologicAct: null,
  EcologicAct: null,
  Declaration: null,
  Fact: null,
  // new event types
  AnthropicDisaster: null,
  NaturalDisaster: null,
  CivilConflict: null,
  Migration: null,
  War: null,
}

export const EventType = t.keyof(EventTypeKeys, "EventType")
export type EventType = t.TypeOf<typeof EventType>

export const BoundingBoxIO = t.union(
  [t.tuple([t.number, t.number, t.number, t.number]), t.array(t.number)],
  "BoundingBoxIO"
)

const PositionIO = t.tuple([t.number, t.number], "PositionIO")

export const PointIO = t.interface(
  {
    type: t.literal("Point"),
    coordinates: PositionIO,
  },
  "PointIO"
)

export type PointIO = t.TypeOf<typeof PointIO>

export const EventFrontmatter = t.strict(
  {
    uuid: t.string,
    title: t.string,
    date: DateFromISOString,
    location: optionFromNullable(ObjectFromString.pipe(PointIO)),
    type: optionFromNullable(EventType),
    cover: optionFromNullable(t.string),
    images: optionFromNullable(
      nonEmptyArray(
        t.type({
          description: optionFromNullable(t.string),
          image: ImageFileNode,
        })
      )
    ),
    links: optionFromNullable(t.array(t.string)),
    actors: optionFromNullable(t.array(ActorFrontmatter)),
    groups: optionFromNullable(t.array(GroupFrontmatter)),
    topics: nonEmptyArray(TopicFrontmatter),
  },
  "EventFrontmatter"
)

export type EventFrontmatter = t.TypeOf<typeof EventFrontmatter>

export const EventMarkdownRemark = t.interface(
  {
    frontmatter: EventFrontmatter,
    htmlAst: t.object,
  },
  "EventMarkdownRemark"
)

export type EventMarkdownRemark = t.TypeOf<typeof EventMarkdownRemark>

export const EventPoint = t.interface(
  {
    x: t.number,
    y: t.number,
    color: t.string,
    data: EventMarkdownRemark,
  },
  "EventPoint"
)
export type EventPoint = t.TypeOf<typeof EventPoint>
