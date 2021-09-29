import { subMonths } from "date-fns";
import { badActor, goodActor } from "./actors";
import {
  firstEventMetadata,
  fourthEventMetadata,
  secondEventMetadata,
  thirdEventMetadata,
} from "./events/events-metadata";
import { badGroup, goodGroup } from "./groups";
import { firstTopic, secondTopic, thirdTopic } from "./topics";
import { Events } from "@io/http";
import { uuid } from "@utils/uuid";

const today = new Date();

// events
export const firstEvent: Events.Uncategorized.Uncategorized = {
  id: uuid(),
  type: Events.Uncategorized.UNCATEGORIZED.value,
  title: "First Event",
  topics: [firstTopic.id],
  actors: [goodActor.id],
  groups: [goodGroup.id],
  groupsMembers: [],
  images: [],
  links: [],
  location: undefined,
  startDate: subMonths(today, 2),
  endDate: undefined,
  body: "",
  createdAt: today,
  updatedAt: today,
};

export const secondEvent: Events.Uncategorized.Uncategorized = {
  id: uuid(),
  type: Events.Uncategorized.UNCATEGORIZED.value,
  title: "Second Event",
  topics: [thirdTopic.id, secondTopic.id],
  actors: [badActor.id],
  groupsMembers: [],
  groups: [],
  images: [],
  links: [],
  location: undefined,
  startDate: subMonths(today, 2),
  endDate: undefined,
  body: "",
  createdAt: today,
  updatedAt: today,
};

export const thirdEvent: Events.Uncategorized.Uncategorized = {
  id: uuid(),
  title: "Third Event",
  type: Events.Uncategorized.UNCATEGORIZED.value,
  topics: [secondTopic.id],
  actors: [badActor.id],
  groups: [goodGroup.id],
  groupsMembers: [],
  images: [],
  links: [],
  location: undefined,
  startDate: subMonths(today, 3),
  endDate: undefined,
  body: "",
  createdAt: today,
  updatedAt: today,
};

export const fourthEvent: Events.Uncategorized.Uncategorized = {
  id: uuid(),
  type: Events.Uncategorized.UNCATEGORIZED.value,
  title: "Fourth Event",
  topics: [secondTopic.id, firstTopic.id],
  actors: [goodActor.id],
  groups: [badGroup.id],
  groupsMembers: [],
  links: [],
  location: undefined,
  images: [],
  startDate: today,
  endDate: undefined,
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
