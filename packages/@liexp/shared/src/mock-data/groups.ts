import { fc } from "@liexp/test";
import { subYears } from "date-fns";
import { Group } from "../io/http";
import { createExcerptValue } from "../slate";
import { HumanReadableStringArb } from "../tests/arbitrary/HumanReadableString.arbitrary";
import { generateRandomColor } from "../utils/colors";
import { uuid } from "../utils/uuid";
import { avatars } from "./avatars";

const now = new Date();

export const firstSubGroup: Group.Group = {
  id: uuid() as any,
  name: "First Good SubGroup",
  kind: "Public",
  avatar: avatars.groups[0],
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
  subGroups: [firstSubGroup.id],
  members: [],
  color: generateRandomColor(),
  createdAt: now,
  updatedAt: now,
  excerpt: createExcerptValue(
    fc.sample(HumanReadableStringArb(), 100).join(" ")
  ),
  body: {},
};

export const badGroup: Group.Group = {
  id: uuid() as any,
  name: "Bad Group",
  kind: "Private",
  avatar: avatars.groups[2],
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
  subGroups: [],
  members: [],
  color: generateRandomColor(),
  createdAt: now,
  updatedAt: now,
  excerpt: {},
  body: {},
};

export const groups: Group.Group[] = [goodGroup, badGroup, secondBadGroup];
