import { ActorFrontmatter } from "@models/actor"
import { generateRandomColor } from "@utils/colors"
import uuid from "@utils/uuid"
import * as O from "fp-ts/lib/Option"
import { firstActorAvatar, secondActorAvatar } from "./avatars"


export const goodActor: ActorFrontmatter = {
  uuid: uuid(),
  fullName: "Good Actor",
  username: "good-actor",
  avatar: O.some(firstActorAvatar),
  color: generateRandomColor(),
  createdAt: new Date(),
  updatedAt: new Date()
}

export const badActor: ActorFrontmatter = {
  uuid: uuid(),
  fullName: "Bad Actor",
  username: "bad-actor",
  avatar: O.some(secondActorAvatar),
  color: generateRandomColor(),
  createdAt: new Date(),
  updatedAt: new Date()
}

export const actors: ActorFrontmatter[] = [goodActor, badActor]
