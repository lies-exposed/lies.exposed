import * as t from "io-ts"
import { DateFromISOString } from "io-ts-types/lib/DateFromISOString"
import { nonEmptyArray } from "io-ts-types/lib/nonEmptyArray"
import { optionFromNullable } from "io-ts-types/lib/optionFromNullable"
import { Point } from "./Common/Point"
import { EventMetadata } from "./EventMetadata"
import { Frontmatter } from "./Frontmatter"
import { ImageAndDescription } from "./Image"
import { JSONFromString } from "./JSONFromString"
import { markdownRemark } from "./Markdown"
import { ActorFrontmatter } from "./actor"
import { GroupFrontmatter } from "./group"
import { TopicFrontmatter } from "./topic"

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
    ...Frontmatter.props,
    title: t.string,
    date: DateFromISOString,
    location: optionFromNullable(JSONFromString.pipe(Point)),
    images: optionFromNullable(nonEmptyArray(ImageAndDescription)),
    links: optionFromNullable(t.array(t.string)),
    metadata: optionFromNullable(t.array(EventMetadata)),
    // todo: remove
    actors: optionFromNullable(t.array(ActorFrontmatter)),
    groups: optionFromNullable(t.array(GroupFrontmatter)),
    topics: nonEmptyArray(TopicFrontmatter),
  },
  "EventFrontmatter"
)

export type EventFrontmatter = t.TypeOf<typeof EventFrontmatter>

export const EventMD = markdownRemark(EventFrontmatter, "EventMD")

export type EventMD = t.TypeOf<typeof EventMD>
