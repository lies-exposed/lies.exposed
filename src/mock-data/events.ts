import { EventFrontmatter } from "@models/events/EventMetadata"
import { Uncategorized } from "@models/events/UncategorizedEvent"
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
export const firstEvent: Uncategorized = {
  uuid: uuid(),
  type: 'Uncategorized',
  title: "First Event",
  topics: NEA.of(firstTopic),
  actors: O.some([goodActor]),
  groups: O.some([goodGroup]),
  links: O.none,
  images: O.none,
  location: O.none,
  date: subMonths(today, 2),
  createdAt: today,
  updatedAt: today,
}

export const secondEvent: Uncategorized = {
  uuid: uuid(),
  type: 'Uncategorized',
  title: "Second Event",
  topics: NEA.concat([thirdTopic], NEA.of(secondTopic)),
  actors: O.some([badActor]),
  groups: O.none,
  links: O.none,
  images: O.none,
  location: O.none,
  date: subMonths(today, 2),
  createdAt: today,
  updatedAt: today,
}

export const thirdEvent: Uncategorized = {
  uuid: uuid(),
  title: "Third Event",
  type: 'Uncategorized',
  topics: NEA.of(secondTopic),
  actors: O.some([badActor]),
  groups: O.some([goodGroup]),
  links: O.none,
  images: O.none,
  location: O.none,
  date: subWeeks(today, 3),
  createdAt: today,
  updatedAt: today,
}

export const fourthEvent: Uncategorized = {
  uuid: uuid(),
  type: 'Uncategorized',
  title: "Fourth Event",
  topics: NEA.concat([secondTopic], NEA.of(firstTopic)),
  actors: O.some([goodActor]),
  groups: O.some([badGroup]),
  location: O.none,
  links: O.none,
  images: O.none,
  date: today,
  createdAt: today,
  updatedAt: today,
}

export const firstGoodProjectEvents: Uncategorized[] = [
  thirdEvent,
  fourthEvent
]

export const uncategorizedEvents: Uncategorized[] = [
  firstEvent,
  secondEvent,
  thirdEvent,
  fourthEvent,
]

export const events: EventFrontmatter[] = [
  ...firstEventMetadata,
  ...secondEventMetadata,
  ...thirdEventMetadata,
  ...fourthEventMetadata,
  ...uncategorizedEvents
]
