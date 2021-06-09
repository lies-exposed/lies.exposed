import { Actor, Common, Group } from "@io/http";
import { eqString } from "fp-ts/lib/Eq";

export const getActors =
  (allActors: Actor.ActorFrontmatter[]) =>
  (actorUUIDs: string[]): Actor.ActorFrontmatter[] => {
    return actorUUIDs.reduce<Actor.ActorFrontmatter[]>((acc, id) => {
      const actor = allActors.find((a) => eqString.equals(a.id, id));
      return actor !== undefined ? acc.concat(actor) : acc;
    }, []);
  };

export const isByActor =
  (actor: Actor.ActorFrontmatter) =>
  (by: Common.ByGroupOrActor): boolean =>
    by.type === "Actor" && by.actor === actor.id;

export const isByGroup =
  (group: Group.GroupFrontmatter) =>
  (by: Common.ByGroupOrActor): boolean =>
    by.type === "Group" && by.group === group.id;
