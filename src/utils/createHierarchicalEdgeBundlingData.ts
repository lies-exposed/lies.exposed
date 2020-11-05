import {
  HierarchicalEdgeBundlingDatum,
  HierarchicalEdgeBundlingProps,
} from "@components/Common/Graph/HierarchicalEdgeBundling"
import { ActorFrontmatter } from "@models/actor"
import { Uncategorized } from "@models/events/UncategorizedEvent"
import { GroupFrontmatter } from "@models/group"
import * as A from "fp-ts/lib/Array"
import * as Eq from "fp-ts/lib/Eq"
import * as Map from "fp-ts/lib/Map"
import * as O from "fp-ts/lib/Option"
import * as Ord from "fp-ts/lib/Ord"
import { pipe } from "fp-ts/lib/pipeable"

interface CreateHierarchicalEdgeBundlingData {
  events: Uncategorized[]
  groups: GroupFrontmatter[]
}

interface LinkMapKeys {
  source: string
  target: string
}

const eqLinkKeys = Eq.eq.contramap(
  Eq.eqString,
  (kk: LinkMapKeys) => `${kk.source}-${kk.target}`
)

export const createHierarchicalEdgeBundling = (
  data: CreateHierarchicalEdgeBundlingData
): HierarchicalEdgeBundlingProps => {
  const nodesMap: Map<string, HierarchicalEdgeBundlingDatum> = Map.empty
  const linksMap: Map<LinkMapKeys, number> = Map.empty
  const init = { nodes: nodesMap, links: linksMap }
  return pipe(
    data.events,
    A.reduce(init, (acc, e) => {
      const actors = pipe(
        e.actors,
        O.getOrElse((): ActorFrontmatter[] => [])
      )

      const result = pipe(
        actors,
        A.reduce(acc, (acc1, a) => {
          const otherActors = actors
            .filter((_) => _.uuid !== a.uuid)
            .map((_) => _.uuid)

          const group = pipe(
            data.groups,
            A.findFirst((g) => {
              return pipe(
                g.members,
                O.mapNullable((members) => {
                  return members.find((m) => m.uuid === a.uuid)
                }),
                O.isSome
              )
            })
          )

          return pipe(
            Map.lookup(Eq.eqString)(a.uuid, acc1.nodes),
            O.alt(() => {
              return pipe(
                group,
                O.map(
                  (g): HierarchicalEdgeBundlingDatum => ({
                    id: a.uuid,
                    label: a.fullName,
                    group: g.uuid,
                    targets: [],
                  })
                )
              )
            }),
            O.map((n) => ({ ...n, targets: otherActors })),
            (n) => {
              return pipe(
                n,
                O.map((o) => {
                  return {
                    links: pipe(
                      otherActors,
                      A.reduce(acc1.links, (linksMap, actorUUID) => {
                        const linkKey = { source: o.id, target: actorUUID }

                        const value = pipe(
                          Map.lookup(eqLinkKeys)(linkKey, linksMap),
                          O.map((value) => value + 1),
                          O.getOrElse(() => 1)
                        )
                        return Map.insertAt(eqLinkKeys)(linkKey, value)(
                          linksMap
                        )
                      })
                    ),
                    nodes: Map.insertAt(Eq.eqString)(a.uuid, o)(acc1.nodes),
                  }
                }),
                O.getOrElse(() => ({ links: acc1.links, nodes: acc1.nodes }))
              )
            }
          )
        })
      )
      return result
    }),
    ({ nodes, links }) => {
      return {
        width: 600,
        graph: {
          nodes: Map.toArray(Ord.ordString)(nodes).map(([, n]) => n),
          links: Map.toArray(
            Ord.ord.contramap(
              Ord.ordString,
              (kk: LinkMapKeys) => `${kk.source}-${kk.target}`
            )
          )(links).map(([kk, value]) => ({ ...kk, value })),
        },
      }
    }
  )
}
