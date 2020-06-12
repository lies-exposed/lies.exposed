import { ActorPageContentFileNode } from "@models/actor"
import { GroupFileNode } from "@models/group"
import * as Eq from "fp-ts/lib/Eq"
import * as Map from "fp-ts/lib/Map"
import * as O from "fp-ts/lib/Option"
import * as Ord from "fp-ts/lib/Ord"
import { pipe } from "fp-ts/lib/pipeable"

export const flattenT = (
  events: GroupFileNode[],
  actors: ActorPageContentFileNode[]
): ActorPageContentFileNode[] => {
  const totalActorsMap = actors.reduce<Map<string, ActorPageContentFileNode>>(
    (acc, a) =>
      Map.insertAt(Eq.eqString)(a.childMarkdownRemark.frontmatter.username, a)(
        acc
      ),
    Map.empty
  )

  const actorsMap = events.reduce<Map<string, ActorPageContentFileNode>>(
    (acc, e) =>
      e.childMarkdownRemark.frontmatter.members.reduce<
        Map<string, ActorPageContentFileNode>
      >((_, a) => {
        return pipe(
          Map.lookup(Eq.eqString)(a, totalActorsMap),
          O.map(actor => Map.insertAt(Eq.eqString)(a, actor)(_)),
          O.getOrElse(() => _)
        )
      }, acc),
    Map.empty
  )

  return Map.values(
    Ord.contramap(
      (a: ActorPageContentFileNode) => a.childMarkdownRemark.frontmatter.username
    )(Ord.ordString)
  )(actorsMap)
}
