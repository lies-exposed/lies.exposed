import { EventFrontmatter } from "@models/event"
import uuid from "@utils/uuid"
import { subMonths, subWeeks } from "date-fns"
import * as NEA from "fp-ts/lib/NonEmptyArray"
import * as O from "fp-ts/lib/Option"
import { goodActor, badActor } from "./actors"
import { firstEventMetadata, fourthEventMetadata, secondEventMetadata, thirdEventMetadata } from "./events-metadata"
import { goodGroup, badGroup } from "./groups"
import { firstTopic, secondTopic, thirdTopic } from "./topics"

const today = new Date()

// events
export const firstEvent: EventFrontmatter = {
  uuid: uuid(),
  title: "First Event",
  topics: NEA.of(firstTopic),
  actors: O.some([goodActor]),
  groups: O.some([goodGroup]),
  links: O.none,
  images: O.none,
  location: O.none,
  date: subMonths(today, 2),
  metadata: O.some(firstEventMetadata),
  createdAt: today,
  updatedAt: today,
}

export const secondEvent: EventFrontmatter = {
  uuid: uuid(),
  title: "Second Event",
  topics: NEA.concat([thirdTopic], NEA.of(secondTopic)),
  actors: O.some([badActor]),
  groups: O.none,
  links: O.none,
  images: O.none,
  location: O.none,
  date: subMonths(today, 2),
  metadata: O.some(secondEventMetadata),
  createdAt: today,
  updatedAt: today,
}

export const thirdEvent: EventFrontmatter = {
  uuid: uuid(),
  title: "Third Event",
  topics: NEA.of(secondTopic),
  actors: O.some([badActor]),
  groups: O.some([goodGroup]),
  links: O.none,
  images: O.none,
  location: O.none,
  metadata: O.some(thirdEventMetadata),
  date: subWeeks(today, 3),
  createdAt: today,
  updatedAt: today,
}

export const fourthEvent: EventFrontmatter = {
  uuid: uuid(),
  title: "Fourth Event",
  topics: NEA.concat([secondTopic], NEA.of(firstTopic)),
  actors: O.some([goodActor]),
  groups: O.some([badGroup]),
  location: O.none,
  links: O.none,
  images: O.none,
  date: today,
  metadata: O.some(fourthEventMetadata),
  createdAt: today,
  updatedAt: today,
}

export const firstGoodProjectEvents: EventFrontmatter[] = [
  thirdEvent,
  fourthEvent
]

export const events: EventFrontmatter[] = [
  firstEvent,
  secondEvent,
  thirdEvent,
  fourthEvent,
]
