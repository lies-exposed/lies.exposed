import { Actor, Common, Group } from "@io/http";
import { eqString } from "fp-ts/lib/Eq";

export const getActors =
  (allActors: Actor.Actor[]) =>
  (actorUUIDs: string[]): Actor.Actor[] => {
    return actorUUIDs.reduce<Actor.Actor[]>((acc, id) => {
      const actor = allActors.find((a) => eqString.equals(a.id, id));
      return actor !== undefined ? acc.concat(actor) : acc;
    }, []);
  };

export const isByActor =
  (actor: Actor.Actor) =>
  (by: Common.ByGroupOrActor): boolean =>
    by.type === "Actor" && by.actor === actor.id;

export const isByGroup =
  (group: Group.GroupFrontmatter) =>
  (by: Common.ByGroupOrActor): boolean =>
    by.type === "Group" && by.group === group.id;
