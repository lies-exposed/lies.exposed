import { EventFrontmatter } from '@models/event'
import uuid from '@utils/uuid'
import * as NEA from 'fp-ts/lib/NonEmptyArray'
import * as O from 'fp-ts/lib/Option'
import moment from 'moment'
import { firstActor, secondActor } from './actors'
import { firstGroup, secondGroup } from './groups'
import { firstTopic, secondTopic, thirdTopic } from './topics'
// events
export const firstEvent: EventFrontmatter = {
  uuid: uuid(),
  title: "First Event",
  type: O.none,
  topics: NEA.of(firstTopic),
  actors: O.some([firstActor, secondActor]),
  groups: O.some([firstGroup]),
  links: O.none,
  images: O.none,
  location: O.none,
  date: moment().subtract(2, "month").toDate(),
}

export const secondEvent: EventFrontmatter = {
  uuid: uuid(),
  title: "Second Event",
  type: O.none,
  topics: NEA.concat([thirdTopic], NEA.of(secondTopic)),
  actors: O.some([secondActor]),
  groups: O.none,
  links: O.none,
  images: O.none,
  location: O.none,
  date: moment().subtract(2, "month").toDate(),
}

export const thirdEvent: EventFrontmatter = {
  uuid: uuid(),
  title: "Third Event",
  type: O.none,
  topics: NEA.of(secondTopic),
  actors: O.some([secondActor]),
  groups: O.some([firstGroup]),
  links: O.none,
  images: O.none,
  location: O.none,
  date: moment().subtract(3, "week").toDate(),
}

export const fourthEvent: EventFrontmatter = {
  uuid: uuid(),
  title: "Fourth Event",
  type: O.some("NaturalDisaster"),
  topics: NEA.concat([secondTopic], NEA.of(firstTopic)),
  actors: O.some([secondActor]),
  groups: O.some([secondGroup]),
  location: O.none,
  links: O.none,
  images: O.none,
  date: new Date(),
}
export const events = [firstEvent, secondEvent, thirdEvent, fourthEvent]