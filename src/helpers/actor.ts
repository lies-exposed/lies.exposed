import { ActorFrontmatter } from "@models/actor"
import { eqString } from "fp-ts/lib/Eq"

export const getActors = (allActors: ActorFrontmatter[]) => (
  actorUUIDs: string[]
): ActorFrontmatter[] => {
  return actorUUIDs.reduce<ActorFrontmatter[]>((acc, uuid) => {
    const actor = allActors.find((a) => eqString.equals(a.uuid, uuid))
    return actor !== undefined ? acc.concat(actor) : acc
  }, [])
}
