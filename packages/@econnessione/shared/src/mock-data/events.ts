import { subMonths } from "date-fns";
import { Events } from "../io/http";
import { uuid } from "../utils/uuid";
import { badActor, goodActor } from "./actors";
import {
  firstEventMetadata,
  fourthEventMetadata,
  secondEventMetadata,
  thirdEventMetadata,
} from "./events/events-metadata";
import { badGroup, goodGroup } from "./groups";

const today = new Date();

// events
export const firstEvent: Events.Event = {
  id: uuid() as any,
  type: Events.Uncategorized.UncategorizedType.value,
  payload: {
    title: "First Event",
    actors: [goodActor.id],
    groups: [goodGroup.id],
    groupsMembers: [],
    location: undefined,
    endDate: undefined,
  },
  keywords: [],
  media: [],
  links: [],
  date: subMonths(today, 2),
  draft: false,
  excerpt: {},
  body: {},
  createdAt: today,
  updatedAt: today,
};

export const secondEvent: Events.Event = {
  id: uuid() as any,
  type: Events.Uncategorized.UncategorizedType.value,
  draft: false,
  payload: {
    title: "Second Event",
    actors: [badActor.id],
    groupsMembers: [],
    groups: [],
    location: undefined,
    endDate: undefined,
  },
  keywords: [],
  media: [],
  links: [],
  date: subMonths(today, 2),
  excerpt: {},
  body: {},
  createdAt: today,
  updatedAt: today,
};

export const thirdEvent: Events.Event = {
  id: uuid() as any,
  type: Events.Uncategorized.UncategorizedType.value,
  payload: {
    title: "Third Event",
    actors: [badActor.id],
    groups: [goodGroup.id],
    groupsMembers: [],
    endDate: undefined,
    location: undefined,
  },
  draft: false,
  keywords: [],
  media: [],
  links: [],
  date: subMonths(today, 3),
  excerpt: {},
  body: {},
  createdAt: today,
  updatedAt: today,
};

export const fourthEvent: Events.Event = {
  id: uuid() as any,
  type: Events.Uncategorized.UncategorizedType.value,
  payload: {
    title: "Fourth Event",
    actors: [goodActor.id],
    groups: [badGroup.id],
    groupsMembers: [],
    location: undefined,
    endDate: undefined,
  },
  draft: false,
  keywords: [],
  links: [],
  media: [],
  date: today,
  excerpt: {},
  body: {},
  createdAt: today,
  updatedAt: today,
};

export const firstGoodProjectEvents: Events.Event[] = [thirdEvent, fourthEvent];

export const uncategorizedEvents: Events.Event[] = [
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
