import { Events } from "@econnessione/shared/lib/io/http";
import uuid from "@utils/uuid";
import { subMonths, subWeeks } from "date-fns";
import * as NEA from "fp-ts/lib/NonEmptyArray";
import * as O from "fp-ts/lib/Option";
import { badActor, goodActor } from "./actors";
import {
  firstEventMetadata,
  fourthEventMetadata,
  secondEventMetadata,
  thirdEventMetadata,
} from "./events/events-metadata";
import { badGroup, goodGroup } from "./groups";
import { firstTopic, secondTopic, thirdTopic } from "./topics";

const today = new Date();

// events
export const firstEvent: Events.Uncategorized.Uncategorized = {
  id: uuid(),
  type: Events.Uncategorized.UNCATEGORIZED.value,
  title: "First Event",
  topics: NEA.of(firstTopic),
  actors: O.some([goodActor.id]),
  groups: O.some([goodGroup]),
  links: O.none,
  images: O.none,
  location: O.none,
  date: subMonths(today, 2),
  body: "",
  createdAt: today,
  updatedAt: today,
};

export const secondEvent: Events.Uncategorized.Uncategorized = {
  id: uuid(),
  type: Events.Uncategorized.UNCATEGORIZED.value,
  title: "Second Event",
  topics: NEA.concat([thirdTopic], NEA.of(secondTopic)),
  actors: O.some([badActor.id]),
  groups: O.none,
  links: O.none,
  images: O.none,
  location: O.none,
  date: subMonths(today, 2),
  body: "",
  createdAt: today,
  updatedAt: today,
};

export const thirdEvent: Events.Uncategorized.Uncategorized = {
  id: uuid(),
  title: "Third Event",
  type: Events.Uncategorized.UNCATEGORIZED.value,
  topics: NEA.of(secondTopic),
  actors: O.some([badActor.id]),
  groups: O.some([goodGroup]),
  links: O.none,
  images: O.none,
  location: O.none,
  date: subWeeks(today, 3),
  body: "",
  createdAt: today,
  updatedAt: today,
};

export const fourthEvent: Events.Uncategorized.Uncategorized = {
  id: uuid(),
  type: Events.Uncategorized.UNCATEGORIZED.value,
  title: "Fourth Event",
  topics: NEA.concat([secondTopic], NEA.of(firstTopic)),
  actors: O.some([goodActor.id]),
  groups: O.some([badGroup]),
  location: O.none,
  links: O.none,
  images: O.none,
  date: today,
  body: "",
  createdAt: today,
  updatedAt: today,
};

export const firstGoodProjectEvents: Events.Uncategorized.Uncategorized[] = [
  thirdEvent,
  fourthEvent,
];

export const uncategorizedEvents: Events.Uncategorized.Uncategorized[] = [
  firstEvent,
  secondEvent,
  thirdEvent,
  fourthEvent,
];

export const events: Events.Event[] = [
  ...firstEventMetadata,
  ...secondEventMetadata,
  ...thirdEventMetadata,
  ...fourthEventMetadata,
  ...uncategorizedEvents,
];
