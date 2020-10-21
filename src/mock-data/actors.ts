import { ActorFrontmatter } from "@models/actor"
import { generateRandomColor } from "@utils/colors"
import uuid from "@utils/uuid"
import * as O from "fp-ts/lib/Option"
import { avatars } from "./avatars"


export const goodActor: ActorFrontmatter = {
  uuid: uuid(),
  fullName: "Good Actor",
  username: "good-actor",
  avatar: O.some(avatars.actors[0]),
  color: generateRandomColor(),
  createdAt: new Date(),
  updatedAt: new Date()
}

export const badActor: ActorFrontmatter = {
  uuid: uuid(),
  fullName: "Bad Actor",
  username: "bad-actor",
  avatar: O.some(avatars.actors[1]),
  color: generateRandomColor(),
  createdAt: new Date(),
  updatedAt: new Date()
}

export const secondActor: ActorFrontmatter = {
  uuid: uuid(),
  fullName: "Second Actor",
  username: "second-actor",
  avatar: O.some(avatars.actors[2]),
  color: generateRandomColor(),
  createdAt: new Date(),
  updatedAt: new Date()
}

export const actors: ActorFrontmatter[] = [goodActor, badActor]
