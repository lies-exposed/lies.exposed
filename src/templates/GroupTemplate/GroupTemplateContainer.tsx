import { ActorMarkdownRemark } from "@models/actor"
import { GroupMarkdownRemark } from "@models/group"
import * as A from 'fp-ts/lib/Array'
import * as Eq from "fp-ts/lib/Eq"
import * as Map from "fp-ts/lib/Map"
import * as O from "fp-ts/lib/Option"
import * as Ord from "fp-ts/lib/Ord"
import { pipe } from "fp-ts/lib/pipeable"

export const flattenT = (
  events: GroupMarkdownRemark[],
  actors: ActorMarkdownRemark[]
): ActorMarkdownRemark[] => {
  const totalActorsMap = actors.reduce<Map<string, ActorMarkdownRemark>>(
    (acc, a) =>
      Map.insertAt(Eq.eqString)(a.frontmatter.uuid, a)(acc),
    Map.empty
  )

  const actorsMap = events.reduce<Map<string, ActorMarkdownRemark>>(
    (acc, e) =>
      pipe(
        e.frontmatter.members,
        O.map(A.map(m => m.uuid)),
        O.getOrElse((): string[] => [])
      )
      .reduce<Map<string, ActorMarkdownRemark>>((_, a) => {
        return pipe(
          Map.lookup(Eq.eqString)(a, totalActorsMap),
          O.map((actor) => Map.insertAt(Eq.eqString)(a, actor)(_)),
          O.getOrElse(() => _)
        )
      }, acc),
    Map.empty
  )

  return Map.values(
    Ord.contramap((a: ActorMarkdownRemark) => a.frontmatter.uuid)(
      Ord.ordString
    )
  )(actorsMap)
}
