import { GroupFrontmatter } from "@models/group"
import { generateRandomColor } from "@utils/colors"
import uuid from "@utils/uuid"
import * as O from 'fp-ts/lib/Option'
import { goodActor, badActor } from "./actors"
import { avatars } from "./avatars"

export const firstSubGroup: GroupFrontmatter = {
  uuid: uuid(),
  name: "First Good SubGroup",
  type: 'Public',
  avatar: O.some(avatars.groups[0]),
  subGroups: O.none,
  members: O.some([goodActor]),
  color: generateRandomColor(),
  createdAt: new Date(),
  updatedAt: new Date()
}

export const goodGroup: GroupFrontmatter = {
  uuid: uuid(),
  name: "Good Group",
  type: 'Public',
  avatar: O.some(avatars.groups[1]),
  subGroups: O.some([firstSubGroup]),
  members: O.some([goodActor, badActor]),
  color: generateRandomColor(),
  createdAt: new Date(),
  updatedAt: new Date()
}

export const badGroup: GroupFrontmatter = {
  uuid: uuid(),
  name: "Bad Group",
  type: 'Private',
  avatar: O.none,
  subGroups: O.none,
  members: O.some([badActor]),
  color: generateRandomColor(),
  createdAt: new Date(),
  updatedAt: new Date()
}

export const groups: GroupFrontmatter[] = [goodGroup, badGroup]