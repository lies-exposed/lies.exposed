import { GroupFrontmatter } from "@models/group"
import { generateRandomColor } from "@utils/colors"
import uuid from "@utils/uuid"
import * as O from 'fp-ts/lib/Option'
import { goodActor, badActor } from "./actors"
import { firstGroupAvatar } from "./avatars"

export const goodGroup: GroupFrontmatter = {
  uuid: uuid(),
  name: "Good Group",
  type: 'Public',
  avatar: O.some(firstGroupAvatar),
  subGroups: O.none,
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