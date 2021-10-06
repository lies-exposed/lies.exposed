import { subYears } from "date-fns";
import { Group } from "../io/http";
import { generateRandomColor } from "../utils/colors";
import { uuid } from "../utils/uuid";
import { avatars } from "./avatars";

const now = new Date();

export const firstSubGroup: Group.Group = {
  id: uuid(),
  name: "First Good SubGroup",
  kind: "Public",
  avatar: avatars.groups[0],
  subGroups: [],
  members: [],
  color: generateRandomColor(),
  createdAt: now,
  updatedAt: now,
  body: "",
};

export const goodGroup: Group.Group = {
  id: uuid(),
  name: "Good Group",
  kind: "Public",
  avatar: avatars.groups[1],
  subGroups: [firstSubGroup.id],
  members: [],
  color: generateRandomColor(),
  createdAt: now,
  updatedAt: now,
  body: "",
};

export const badGroup: Group.Group = {
  id: uuid(),
  name: "Bad Group",
  kind: "Private",
  avatar: avatars.groups[2],
  subGroups: [],
  members: [],
  color: generateRandomColor(),
  createdAt: subYears(now, 2),
  updatedAt: now,
  body: "",
};

export const secondBadGroup: Group.Group = {
  id: uuid(),
  name: "Bad Group - The 2nd",
  kind: "Private",
  avatar: avatars.groups[3],
  subGroups: [],
  members: [],
  color: generateRandomColor(),
  createdAt: now,
  updatedAt: now,
  body: "",
};

export const groups: Group.Group[] = [goodGroup, badGroup, secondBadGroup];
