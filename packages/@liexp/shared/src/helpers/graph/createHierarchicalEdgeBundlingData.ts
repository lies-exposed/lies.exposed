import { GetLogger } from "@liexp/core/logger";
import type { Graph } from "@visx/network/lib/types";
import * as A from "fp-ts/lib/Array";
import * as Eq from "fp-ts/lib/Eq";
import * as Map from "fp-ts/lib/Map";
import * as O from "fp-ts/lib/Option";
import * as Ord from "fp-ts/lib/Ord";
import { pipe } from "fp-ts/lib/function";
import * as S from "fp-ts/lib/string";
import { Actor, Events, Group, Keyword } from "../../io/http";
import { UUID } from "../../io/http/Common";
import { getEventsMetadata } from "../event";

const logger = GetLogger("hierarchy-edge-bundling");

interface CreateHierarchicalEdgeBundlingData {
  events: Events.SearchEvent.SearchEvent[];
  groups: Group.Group[];
  actors: Actor.Actor[];
  relation: "actor" | "group" | "keyword";
  hideEmptyRelations: boolean;
}

interface LinkMapKeys {
  source: UUID;
  target: UUID;
}

export interface HierarchicalEdgeBundlingDatum {
  id: UUID;
  label: string;
  avatar?: string;
  color?: string;
  text?: string;
  group: string;
  targets: string[];
}

interface Link {
  source: UUID;
  target: UUID;
  value: number;
}

export interface HierarchicalEdgeBundlingProps {
  width: number;
  graph: Graph<Link, HierarchicalEdgeBundlingDatum>;
}

const eqLinkKeys = Eq.eq.contramap(
  S.Eq,
  (kk: LinkMapKeys) => `${kk.source}-${kk.target}`
);

export const createHierarchicalEdgeBundling = ({
  hideEmptyRelations,
  relation,
  ...data
}: CreateHierarchicalEdgeBundlingData): HierarchicalEdgeBundlingProps => {
  const nodesMap: Map<UUID, HierarchicalEdgeBundlingDatum> = Map.empty;
  const linksMap: Map<LinkMapKeys, number> = Map.empty;
  const init = { nodes: nodesMap, links: linksMap };
  logger.debug.log("create hierarchy edge bundling from data", data);
  return pipe(
    data.events,
    A.reduce(init, (acc, e) => {
      const {
        actors: eventActors,
        groups: eventGroups,
        keywords: eventKeywords,
      } = getEventsMetadata(e);

      logger.debug.log("event %O", e);
      logger.debug.log("relations %O", {
        actors: eventActors,
        groups: eventGroups,
        keywords: eventKeywords,
      });

      const eventRelation: Array<Keyword.Keyword | Actor.Actor | Group.Group> =
        relation === "actor"
          ? eventActors
          : relation === "group"
          ? eventGroups
          : eventKeywords;

      const result = pipe(
        eventRelation,
        A.reduce(acc, (acc1, g) => {
          const otherRelations: Array<{ id: UUID }> = eventRelation.filter(
            (_) => _.id !== g.id
          );

          return pipe(
            Map.lookup(S.Eq)(g.id, acc1.nodes),
            O.alt(() => {
              return pipe(
                O.some(g),
                O.map(
                  (g: any): HierarchicalEdgeBundlingDatum => ({
                    id: g.id,
                    label: g.tag ?? g.fullName ?? g.name,
                    avatar: g.avatar ?? "",
                    color: g.color,
                    group: g.id,
                    targets: [],
                  })
                )
              );
            }),
            O.map((n) => ({
              ...n,
              targets: otherRelations.map((a) => a.id as string),
            })),
            (n) => {
              return pipe(
                n,
                O.map((o) => {
                  const nodes = hideEmptyRelations
                    ? o.targets.length > 0
                      ? Map.upsertAt(S.Eq as Eq.Eq<UUID>)(g.id, o)(acc1.nodes)
                      : acc1.nodes
                    : Map.upsertAt(S.Eq as Eq.Eq<UUID>)(g.id, o)(acc1.nodes);

                  return {
                    links: pipe(
                      otherRelations,
                      A.reduce(acc1.links, (linksMap, rel) => {
                        const linkKey = { source: o.id, target: rel.id };

                        const value = pipe(
                          Map.lookup(eqLinkKeys)(linkKey, linksMap),
                          O.map((value) => value + 1),
                          O.getOrElse(() => 1)
                        );

                        return Map.upsertAt(eqLinkKeys)(linkKey, value)(
                          linksMap
                        );
                      })
                    ),
                    nodes,
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
    (results) => {
      const nodes = Map.toArray(S.Ord)(results.nodes).map(([, n]) => n);
      const links = pipe(
        results.links,
        Map.toArray(
          Ord.ord.contramap(
            S.Ord,
            (kk: LinkMapKeys) => `${kk.source}-${kk.target}`
          )
        ),
        A.map(([kk, value]) => ({ ...kk, value }))
      );

      logger.debug.log("Result nodes %O", nodes);
      logger.debug.log("Result links %O", links);

      return {
        width: 600,
        graph: {
          nodes,
          links,
        },
      };
    }
  );
};
