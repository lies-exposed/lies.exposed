import { ActorFrontmatter } from "@models/actor"
import { eqString } from "fp-ts/lib/Eq"

export const getActors = (allActors: ActorFrontmatter[]) => (
  actorUsernames: string[]
): ActorFrontmatter[] => {
  return actorUsernames.reduce<ActorFrontmatter[]>(
    (acc, username) => {
      const actor = allActors.find(a => eqString.equals(a.username, username))
      return actor !== undefined ? acc.concat(actor) : acc
    },
    []
  )
}
