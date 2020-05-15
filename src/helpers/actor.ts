import { ActorPageContentFileNodeFrontmatter } from "@models/actor"
import { eqString } from "fp-ts/lib/Eq"

export const getActors = (allActors: ActorPageContentFileNodeFrontmatter[]) => (
  actorUsernames: string[]
): ActorPageContentFileNodeFrontmatter[] => {
  return actorUsernames.reduce<ActorPageContentFileNodeFrontmatter[]>(
    (acc, username) => {
      const actor = allActors.find(a => eqString.equals(a.username, username))
      return actor !== undefined ? acc.concat(actor) : acc
    },
    []
  )
}
