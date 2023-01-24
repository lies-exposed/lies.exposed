import * as S from "fp-ts/string";
import { type Actor, type Common, type Group } from "../io/http";

export const getActors =
  (allActors: Actor.Actor[]) =>
  (actorUUIDs: string[]): Actor.Actor[] => {
    return actorUUIDs.reduce<Actor.Actor[]>((acc, id) => {
      const actor = allActors.find((a) => S.Eq.equals(a.id, id));
      return actor !== undefined ? acc.concat(actor) : acc;
    }, []);
  };

export const isByActor =
  (actor: Actor.Actor) =>
  (by: Common.BySubject): boolean =>
    by.type === "Actor" && by.id === actor.id;

export const isByGroup =
  (group: Group.Group) =>
  (by: Common.BySubject): boolean =>
    by.type === "Group" && by.id === group.id;
