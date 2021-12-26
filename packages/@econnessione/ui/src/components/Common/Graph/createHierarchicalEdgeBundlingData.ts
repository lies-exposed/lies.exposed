import { Events, Group } from "@econnessione/shared/io/http";
import * as A from "fp-ts/lib/Array";
import * as Eq from "fp-ts/lib/Eq";
import * as Map from "fp-ts/lib/Map";
import * as O from "fp-ts/lib/Option";
import * as Ord from "fp-ts/lib/Ord";
import { pipe } from "fp-ts/lib/pipeable";
import {
  HierarchicalEdgeBundlingDatum,
  HierarchicalEdgeBundlingProps,
} from "@components/Common/Graph/HierarchicalEdgeBundling";

interface CreateHierarchicalEdgeBundlingData {
  events: Events.Uncategorized.Uncategorized[];
  groups: Group.Group[];
}

interface LinkMapKeys {
  source: string;
  target: string;
}

const eqLinkKeys = Eq.eq.contramap(
  Eq.eqString,
  (kk: LinkMapKeys) => `${kk.source}-${kk.target}`
);

export const createHierarchicalEdgeBundling = (
  data: CreateHierarchicalEdgeBundlingData
): HierarchicalEdgeBundlingProps => {
  const nodesMap: Map<string, HierarchicalEdgeBundlingDatum> = Map.empty;
  const linksMap: Map<LinkMapKeys, number> = Map.empty;
  const init = { nodes: nodesMap, links: linksMap };
  return pipe(
    data.events,
    A.reduce(init, (acc, e) => {
      const actorIds = pipe(
        e.payload.actors,
        O.fromPredicate((i) => i.length > 0),
        O.getOrElse((): string[] => [])
      );

      const result = pipe(
        actorIds,
        A.reduce(acc, (acc1, aId) => {
          const otherActors = actorIds.filter((_) => _ !== aId).map((_) => _);

          const group = pipe(
            data.groups,
            A.findFirst((g) => {
              return true;
              // return pipe(
              //   g.members,
              //   O.chainNullableK((members) => {
              //     // return members.find((m) => m === a.id);
              //   }),
              //   O.isSome
              // );
            })
          );

          return pipe(
            Map.lookup(Eq.eqString)(aId, acc1.nodes),
            O.alt(() => {
              return pipe(
                group,
                O.map(
                  (g): HierarchicalEdgeBundlingDatum => ({
                    id: aId,
                    label: aId,
                    group: g.id,
                    targets: [],
                  })
                )
              );
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
                        const linkKey = { source: o.id, target: actorUUID };

                        const value = pipe(
                          Map.lookup(eqLinkKeys)(linkKey, linksMap),
                          O.map((value) => value + 1),
                          O.getOrElse(() => 1)
                        );
                        return Map.insertAt(eqLinkKeys)(linkKey, value)(
                          linksMap
                        );
                      })
                    ),
                    nodes: Map.insertAt(Eq.eqString)(aId, o)(acc1.nodes),
                  };
                }),
                O.getOrElse(() => ({ links: acc1.links, nodes: acc1.nodes }))
              );
            }
          );
        })
      );
      return result;
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
      };
    }
  );
};
