import * as t from "io-ts"
import { DateFromISOString } from "io-ts-types/lib/DateFromISOString"
import { date } from "io-ts-types/lib/date"
import { nonEmptyArray } from "io-ts-types/lib/nonEmptyArray"
import { optionFromNullable } from "io-ts-types/lib/optionFromNullable"
import { Point } from "./Common/Point"
import { ImageAndDescription } from "./Image"
import { JSONFromString } from "./JSONFromString"
import { mdx } from "./Mdx"
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

export const EventTypeKeys = {
  // old types
  Declaration: null,
  Act: null,
  // new event types
  AnthropicDisaster: null,
  NaturalDisaster: null,
  CivilConflict: null,
  Migration: null,
  War: null,
}

export const EventType = t.keyof(EventTypeKeys, "EventType")
export type EventType = t.TypeOf<typeof EventType>

export const EventFrontmatter = t.strict(
  {
    uuid: t.string,
    title: t.string,
    date: DateFromISOString,
    location: optionFromNullable(JSONFromString.pipe(Point)),
    type: optionFromNullable(EventType),
    images: optionFromNullable(nonEmptyArray(ImageAndDescription)),
    links: optionFromNullable(t.array(t.string)),
    actors: optionFromNullable(t.array(ActorFrontmatter)),
    groups: optionFromNullable(t.array(GroupFrontmatter)),
    topics: nonEmptyArray(TopicFrontmatter),
  },
  "EventFrontmatter"
)

export type EventFrontmatter = t.TypeOf<typeof EventFrontmatter>

export const EventMD = mdx(EventFrontmatter, "EventMD")

export type EventMD = t.TypeOf<typeof EventMD>
