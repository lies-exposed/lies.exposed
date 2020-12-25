import { Group } from "@econnessione/io"
import { generateRandomColor } from "@utils/colors"
import uuid from "@utils/uuid"
import { subYears } from "date-fns"
import * as O from 'fp-ts/lib/Option'
import { badActor, goodActor } from "./actors"
import { avatars } from "./avatars"

const now = new Date()

export const firstSubGroup: Group.GroupFrontmatter = {
  id: uuid(),
  name: "First Good SubGroup",
  type: 'GroupFrontmatter',
  kind: 'Public',
  avatar: O.some(avatars.groups[0]),
  subGroups: O.none,
  members: O.some([goodActor]),
  color: generateRandomColor(),
  createdAt: now,
  updatedAt: now
}

export const goodGroup: Group.GroupFrontmatter = {
  id: uuid(),
  name: "Good Group",
  type: 'GroupFrontmatter',
  kind: 'Public',
  avatar: O.some(avatars.groups[1]),
  subGroups: O.some([firstSubGroup]),
  members: O.some([goodActor, badActor]),
  color: generateRandomColor(),
  createdAt: now,
  updatedAt: now
}

export const badGroup: Group.GroupFrontmatter = {
  id: uuid(),
  name: "Bad Group",
  type: 'GroupFrontmatter',
  kind: 'Private',
  avatar: O.some(avatars.groups[2]),
  subGroups: O.none,
  members: O.some([badActor]),
  color: generateRandomColor(),
  createdAt: subYears( now, 2),
  updatedAt: now
}

export const secondBadGroup: Group.GroupFrontmatter = {
  id: uuid(),
  name: "Bad Group - The 2nd",
  type: 'GroupFrontmatter',
  kind: 'Private',
  avatar: O.some(avatars.groups[3]),
  subGroups: O.none,
  members: O.some([badActor]),
  color: generateRandomColor(),
  createdAt: now,
  updatedAt: now
}

export const groups: Group.GroupFrontmatter[] = [goodGroup, badGroup, secondBadGroup]