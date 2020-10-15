import { GroupFrontmatter } from "@models/group"
import { generateRandomColor } from "@utils/colors"
import uuid from "@utils/uuid"
import * as O from 'fp-ts/lib/Option'
import { firstActor, secondActor } from "./actors"

export const firstGroup: GroupFrontmatter = {
  uuid: uuid(),
  name: "First Group",
  date: new Date(),
  avatar: O.none,
  subGroups: O.none,
  members: O.some([firstActor, secondActor]),
  color: generateRandomColor(),
}

export const secondGroup: GroupFrontmatter = {
  uuid: uuid(),
  name: "Second Group",
  date: new Date(),
  avatar: O.none,
  subGroups: O.none,
  members: O.some([secondActor]),
  color: generateRandomColor(),
}

export const groups = [firstGroup, secondGroup]