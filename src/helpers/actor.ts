import { ByGroupOrActor } from "@models/Common/ByGroupOrActor"
import { ActorFrontmatter } from "@models/actor"
import { GroupFrontmatter } from "@models/group"
import { eqString } from "fp-ts/lib/Eq"

export const getActors = (allActors: ActorFrontmatter[]) => (
  actorUUIDs: string[]
): ActorFrontmatter[] => {
  return actorUUIDs.reduce<ActorFrontmatter[]>((acc, uuid) => {
    const actor = allActors.find((a) => eqString.equals(a.uuid, uuid))
    return actor !== undefined ? acc.concat(actor) : acc
  }, [])
}

export const isByActor = (
  actor: ActorFrontmatter
) => (by: ByGroupOrActor): boolean => by.__type === "Actor" && by.actor.uuid === actor.uuid

export const isByGroup = (
  group: GroupFrontmatter
) => (by: ByGroupOrActor): boolean => by.__type === 'Group' && by.group.uuid === group.uuid
