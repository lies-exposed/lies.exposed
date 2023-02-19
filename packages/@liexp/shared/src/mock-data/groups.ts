import { subYears } from "date-fns";
import { type Group } from "../io/http";
import { generateRandomColor } from "../utils/colors";
import { uuid } from "../utils/uuid";
import { avatars } from "./avatars";

const now = new Date();

export const firstSubGroup: Group.Group = {
  id: uuid() as any,
  name: "First Good SubGroup",
  kind: "Public",
  avatar: avatars.groups[0],
  startDate: undefined,
  endDate: undefined,
  subGroups: [],
  members: [],
  color: generateRandomColor(),
  createdAt: now,
  updatedAt: now,
  excerpt: {},
  body: {},
};

export const goodGroup: Group.Group = {
  id: uuid() as any,
  name: "Good Group",
  kind: "Public",
  avatar: avatars.groups[1],
  startDate: undefined,
  endDate: undefined,
  subGroups: [firstSubGroup.id],
  members: [],
  color: generateRandomColor(),
  createdAt: now,
  updatedAt: now,
  excerpt: {},
  body: {},
};

export const badGroup: Group.Group = {
  id: uuid() as any,
  name: "Bad Group",
  kind: "Private",
  avatar: avatars.groups[2],
  startDate: undefined,
  endDate: undefined,
  subGroups: [],
  members: [],
  color: generateRandomColor(),
  createdAt: subYears(now, 2),
  updatedAt: now,
  excerpt: {},
  body: {},
};

export const secondBadGroup: Group.Group = {
  id: uuid() as any,
  name: "Bad Group - The 2nd",
  kind: "Private",
  avatar: avatars.groups[3],
  startDate: undefined,
  endDate: undefined,
  subGroups: [],
  members: [],
  color: generateRandomColor(),
  createdAt: now,
  updatedAt: now,
  excerpt: {},
  body: {},
};

export const groups: Group.Group[] = [goodGroup, badGroup, secondBadGroup];
