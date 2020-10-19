import { EventFrontmatter } from "@models/event"
import uuid from "@utils/uuid"
import { subMonths, subWeeks } from "date-fns"
import * as NEA from "fp-ts/lib/NonEmptyArray"
import * as O from "fp-ts/lib/Option"
import { goodActor, badActor } from "./actors"
import { goodGroup, badGroup } from "./groups"
import { firstGoodProject } from "./projects"
import { firstTopic, secondTopic, thirdTopic } from "./topics"
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
  date: subMonths(new Date(), 2),
  metadata: O.none,
  createdAt: new Date(),
  updatedAt: new Date(),
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
  date: subMonths(new Date(), 2),
  metadata: O.none,
  createdAt: new Date(),
  updatedAt: new Date(),
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
  metadata: O.some([
    {
      type: "ProjectFund",
      project: firstGoodProject,
      by: { __type: "Group", group: goodGroup },
    },
  ]),
  date: subWeeks(new Date(), 3),
  createdAt: new Date(),
  updatedAt: new Date(),
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
  date: new Date(),
  metadata: O.some([
    {
      type: "Protest",
      by: [{ __type: "Group", group: goodGroup }],
      for: { __type: "ForProject", uuid: firstGoodProject.uuid },
      images: O.none,
    },
  ]),
  createdAt: new Date(),
  updatedAt: new Date(),
}
export const events: EventFrontmatter[] = [
  firstEvent,
  secondEvent,
  thirdEvent,
  fourthEvent,
]
