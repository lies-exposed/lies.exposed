import { pipe } from "@liexp/core/lib/fp/index.js";
import { type ReaderTaskEither } from "fp-ts/lib/ReaderTaskEither.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { In } from "typeorm";
import { type DatabaseContext } from "../../context/db.context.js";
import { type LoggerContext } from "../../context/logger.context.js";
import { ActorEntity } from "../../entities/Actor.entity.js";
import { ActorRelationEntity } from "../../entities/ActorRelation.entity.js";
import { type ServerError } from "../../errors/ServerError.js";

export interface ActorNode {
  id: string;
  name: string;
  fullName: string;
  avatar: string | null;
  bornOn: string | null;
  diedOn: string | null;
  children: string[];
  parents: string[];
  spouses: string[];
  partners: string[];
  siblings: string[];
  isSpouse?: boolean;
  isSibling?: boolean;
}

export type TreeMap = Record<string, ActorNode>;

/**
 * Builds a flat actor relation tree map using breadth-first traversal so that
 * all actors at the same depth are fetched in a single batch.  This reduces
 * the total number of DB queries from O(N) to O(depth) — typically 9 queries
 * maximum (3 per level × 3 levels):
 *   Batch 1 – fetch actor rows for the current level
 *   Batch 2 – fetch all relations touching any actor in the current level
 *   Batch 3 – fetch sibling relations (children of all parents found above)
 *
 * Cycle safety: all nodes in a level are added to `visited` before their
 * arrays are built, so back-edges (e.g. B.children contains A when A is
 * B's ancestor) are filtered out.  If a node appears in both `children` and
 * `parents` of the same node (bidirectional PARENT_CHILD cycle) the children
 * direction takes priority so the node is not double-rendered by entitree-flex.
 */
export const buildActorRelationTree = <
  C extends DatabaseContext & LoggerContext,
>(
  actorId: string,
  maxDepth: number,
): ReaderTaskEither<C, ServerError, TreeMap> => {
  return (ctx) => {
    const visited = new Set<string>();
    const treeMap: TreeMap = {};

    const processLevel = (
      levelIds: string[],
      depth: number,
    ): TE.TaskEither<ServerError, void> => {
      const unvisited = levelIds.filter((id) => !visited.has(id));
      if (unvisited.length === 0 || depth > maxDepth) {
        return TE.right(undefined);
      }

      // Mark the whole batch as visited before building nodes so that
      // same-level back-edges are filtered correctly.
      unvisited.forEach((id) => visited.add(id));

      return pipe(
        // Batch 1: fetch actor rows
        ctx.db.find(ActorEntity, {
          where: { id: In(unvisited) },
          relations: ["avatar"],
        }),
        TE.chain((actors) =>
          pipe(
            // Batch 2: fetch all relations touching any actor in this level
            ctx.db.find(ActorRelationEntity, {
              where: [
                { actor: { id: In(unvisited) } },
                { relatedActor: { id: In(unvisited) } },
              ],
              relations: [
                "actor",
                "relatedActor",
                "actor.avatar",
                "relatedActor.avatar",
              ],
            }),
            TE.map((relations) => ({ actors, relations })),
          ),
        ),
        TE.chain(({ actors, relations }) => {
          const actorMap = new Map<string, ActorEntity>(
            actors.map((a) => [a.id as string, a]),
          );

          // Per-actor relation buckets and the union of parent IDs needed for
          // the sibling query.
          const nodeRelations = new Map<
            string,
            {
              children: string[];
              parents: string[];
              spouses: string[];
              partners: string[];
            }
          >();
          const allParentIds = new Set<string>();

          for (const id of unvisited) {
            const nr = {
              children: [] as string[],
              parents: [] as string[],
              spouses: [] as string[],
              partners: [] as string[],
            };

            for (const rel of relations) {
              if (rel.actor.id !== id && rel.relatedActor.id !== id) continue;

              if (rel.type === "PARENT_CHILD") {
                if (rel.actor.id === id) {
                  nr.children.push(rel.relatedActor.id);
                } else {
                  nr.parents.push(rel.actor.id);
                  allParentIds.add(rel.actor.id);
                }
              } else if (rel.type === "SPOUSE") {
                const sid =
                  rel.actor.id === id ? rel.relatedActor.id : rel.actor.id;
                nr.spouses.push(sid);
              } else if (rel.type === "PARTNER") {
                const pid =
                  rel.actor.id === id ? rel.relatedActor.id : rel.actor.id;
                nr.partners.push(pid);
              }
            }

            nodeRelations.set(id, nr);
          }

          // Batch 3: single query to discover siblings of all actors in this
          // level (children of their parents, excluding themselves).
          const siblingQueryTE =
            allParentIds.size > 0
              ? ctx.db.find(ActorRelationEntity, {
                  where: {
                    actor: { id: In([...allParentIds]) },
                    type: In(["PARENT_CHILD"]),
                  },
                  relations: ["actor", "relatedActor"],
                })
              : TE.right<ServerError, ActorRelationEntity[]>([]);

          return pipe(
            siblingQueryTE,
            TE.map((siblingRels) => {
              const nextLevelIds: string[] = [];

              for (const id of unvisited) {
                const actor = actorMap.get(id);
                if (!actor) continue;

                const nr = nodeRelations.get(id)!;

                // Siblings = other children of this actor's parents.
                // We intentionally do NOT filter siblings for visited IDs here
                // (same as the original DFS behaviour) because entitree-flex
                // positions siblings laterally via nextBeforeAccessor and never
                // recurses into them, so they cannot cause infinite loops.
                const siblings = Array.from(
                  new Set(
                    siblingRels
                      .filter((r) => nr.parents.includes(r.actor.id))
                      .map((r) => r.relatedActor.id)
                      .filter((sibId) => sibId !== id),
                  ),
                );

                // Queue unvisited relatives for the next level.
                for (const relId of [
                  ...nr.children,
                  ...nr.parents,
                  ...nr.spouses,
                  ...nr.partners,
                  ...siblings,
                ]) {
                  if (!visited.has(relId)) {
                    nextLevelIds.push(relId);
                  }
                }

                // Build node — filter visited IDs from directed arrays to
                // remove back-edges.  If a node appears in both children and
                // parents (bidirectional cycle with bad data), prefer children
                // so it is not double-rendered by entitree-flex.
                const childrenFiltered = nr.children.filter(
                  (cId) => !visited.has(cId),
                );
                const childrenSet = new Set(childrenFiltered);

                treeMap[id] = {
                  id: actor.id,
                  name: actor.username,
                  fullName: actor.fullName,
                  avatar:
                    typeof actor.avatar === "object" &&
                    actor.avatar !== null &&
                    "location" in actor.avatar
                      ? actor.avatar.location
                      : null,
                  bornOn: (actor.bornOn as any) ?? null,
                  diedOn: (actor.diedOn as any) ?? null,
                  children: childrenFiltered,
                  parents: nr.parents.filter(
                    (pId) => !visited.has(pId) && !childrenSet.has(pId),
                  ),
                  spouses: nr.spouses.filter((sId) => !visited.has(sId)),
                  partners: nr.partners.filter((pId) => !visited.has(pId)),
                  siblings,
                };
              }

              return [...new Set(nextLevelIds)];
            }),
            TE.chain((nextIds) => processLevel(nextIds, depth + 1)),
          );
        }),
      );
    };

    // Validate the root actor exists before starting the BFS so that requests
    // for non-existent actors still return 404 (using find instead of
    // findOneOrFail in processLevel would silently return an empty map).
    return pipe(
      ctx.db.findOneOrFail(ActorEntity, {
        where: { id: In([actorId]) },
        relations: ["avatar"],
      }),
      TE.chain(() => processLevel([actorId], 0)),
      TE.map(() => treeMap),
    );
  };
};
