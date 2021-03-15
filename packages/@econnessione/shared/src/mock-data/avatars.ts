import * as A from "fp-ts/lib/Array";
import { pipe } from "fp-ts/lib/pipeable";

interface Avatars {
  actors: {
    [key: number]: string;
  };
  groups: {
    [key: number]: string;
  };
}

export const avatars: Avatars = {
  // Actors
  actors: pipe(
    A.range(0, 10),
    A.map((number) => require(`./assets/actors/actor-${number}.svg`)),
    A.reduceWithIndex({}, (number, acc, asset) => ({
      ...acc,
      [number]: asset,
    }))
  ),
  // Groups
  groups: pipe(
    A.range(0, 10),
    A.map((number) =>
      require(`./assets/groups/group-${number}.svg`)
    ),
    A.reduceWithIndex({}, (number, acc, asset) => ({
      ...acc,
      [number]: asset,
    }))
  ),
};
