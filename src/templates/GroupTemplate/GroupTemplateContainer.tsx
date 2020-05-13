import { ActorFileNode } from "@models/actor"
import { GroupFileNode } from "@models/group"
import * as Eq from "fp-ts/lib/Eq"
import * as Map from "fp-ts/lib/Map"
import * as O from "fp-ts/lib/Option"
import * as Ord from "fp-ts/lib/Ord"
import { pipe } from "fp-ts/lib/pipeable"

export const flattenT = (
  events: GroupFileNode[],
  actors: ActorFileNode[]
): ActorFileNode[] => {
  const totalActorsMap = actors.reduce<Map<string, ActorFileNode>>(
    (acc, a) =>
      Map.insertAt(Eq.eqString)(a.childMarkdownRemark.frontmatter.title, a)(
        acc
      ),
    Map.empty
  )

  const actorsMap = events.reduce<Map<string, ActorFileNode>>(
    (acc, e) =>
      e.childMarkdownRemark.frontmatter.members.reduce<
        Map<string, ActorFileNode>
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
    Ord.contramap((a: ActorFileNode) => a.childMarkdownRemark.frontmatter.title)(Ord.ordString)
  )(actorsMap)
}
