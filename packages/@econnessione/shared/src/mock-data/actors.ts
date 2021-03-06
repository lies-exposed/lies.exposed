import { Actor } from "@io/http";
import { generateRandomColor } from "@utils/colors";
import { uuid } from "@utils/uuid";
import { avatars } from "./avatars";

const today = new Date();

export const goodActor: Actor.ActorFrontmatter = {
  id: uuid(),
  type: Actor.ACTOR_FRONTMATTER.value,
  fullName: "Good Actor",
  username: "good-actor",
  avatar: avatars.actors[0],
  color: generateRandomColor(),
  createdAt: today,
  updatedAt: today,
};

export const goodSecondActor: Actor.ActorFrontmatter = {
  id: uuid(),
  type: "ActorFrontmatter",
  fullName: "Good Actor - The 2nd",
  username: "good-actor-the-2nd",
  avatar: avatars.actors[1],
  color: generateRandomColor(),
  createdAt: today,
  updatedAt: today,
};

export const badActor: Actor.ActorFrontmatter = {
  id: uuid(),
  type: "ActorFrontmatter",
  fullName: "Bad Actor",
  username: "bad-actor",
  avatar: avatars.actors[2],
  color: generateRandomColor(),
  createdAt: today,
  updatedAt: today,
};

export const badSecondActor: Actor.ActorFrontmatter = {
  id: uuid(),
  type: "ActorFrontmatter",
  fullName: "Bad Actor - The 2nd",
  username: "bad-actor-the-2nd",
  avatar: avatars.actors[3],
  color: generateRandomColor(),
  createdAt: today,
  updatedAt: today,
};

export const actors: Actor.ActorFrontmatter[] = [
  goodActor,
  badActor,
  badSecondActor,
];
