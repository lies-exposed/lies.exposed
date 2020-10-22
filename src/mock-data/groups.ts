import { GroupFrontmatter } from "@models/group"
import { generateRandomColor } from "@utils/colors"
import uuid from "@utils/uuid"
import { subYears } from "date-fns"
import * as O from 'fp-ts/lib/Option'
import { goodActor, badActor } from "./actors"
import { avatars } from "./avatars"

const now = new Date()

export const firstSubGroup: GroupFrontmatter = {
  uuid: uuid(),
  name: "First Good SubGroup",
  type: 'Public',
  avatar: O.some(avatars.groups[0]),
  subGroups: O.none,
  members: O.some([goodActor]),
  color: generateRandomColor(),
  createdAt: now,
  updatedAt: now
}

export const goodGroup: GroupFrontmatter = {
  uuid: uuid(),
  name: "Good Group",
  type: 'Public',
  avatar: O.some(avatars.groups[1]),
  subGroups: O.some([firstSubGroup]),
  members: O.some([goodActor, badActor]),
  color: generateRandomColor(),
  createdAt: now,
  updatedAt: now
}

export const badGroup: GroupFrontmatter = {
  uuid: uuid(),
  name: "Bad Group",
  type: 'Private',
  avatar: O.none,
  subGroups: O.none,
  members: O.some([badActor]),
  color: generateRandomColor(),
  createdAt: subYears( now, 2),
  updatedAt: now
}

export const secondBadGroup: GroupFrontmatter = {
  uuid: uuid(),
  name: "Bad Group - The 2nd",
  type: 'Private',
  avatar: O.none,
  subGroups: O.none,
  members: O.some([badActor]),
  color: generateRandomColor(),
  createdAt: now,
  updatedAt: now
}

export const groups: GroupFrontmatter[] = [goodGroup, badGroup, secondBadGroup]