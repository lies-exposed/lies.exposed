import { Actor } from "@io/http";
import { generateRandomColor } from "@utils/colors";
import { uuid } from "@utils/uuid";
import { avatars } from "./avatars";

const today = new Date();

export const goodActor: Actor.Actor = {
  id: uuid(),
  fullName: "Good Actor",
  username: "good-actor",
  avatar: avatars.actors[0],
  color: generateRandomColor(),
  death: undefined,
  body: "",
  createdAt: today,
  updatedAt: today,
};

export const goodSecondActor: Actor.Actor = {
  id: uuid(),
  fullName: "Good Actor - The 2nd",
  username: "good-actor-the-2nd",
  avatar: avatars.actors[1],
  color: generateRandomColor(),
  death: undefined,
  body: "",
  createdAt: today,
  updatedAt: today,
};

export const badActor: Actor.Actor = {
  id: uuid(),
  fullName: "Bad Actor",
  username: "bad-actor",
  avatar: avatars.actors[2],
  color: generateRandomColor(),
  death: undefined,
  body: "",
  createdAt: today,
  updatedAt: today,
};

export const badSecondActor: Actor.Actor = {
  id: uuid(),
  fullName: "Bad Actor - The 2nd",
  username: "bad-actor-the-2nd",
  avatar: avatars.actors[3],
  color: generateRandomColor(),
  death: undefined,
  body: "",
  createdAt: today,
  updatedAt: today,
};

export const actors: Actor.Actor[] = [goodActor, badActor, badSecondActor];
