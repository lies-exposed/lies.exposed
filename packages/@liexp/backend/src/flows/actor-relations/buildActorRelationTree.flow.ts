import { pipe } from "@liexp/core/lib/fp/index.js";
import * as A from "fp-ts/lib/Array.js";
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
  spouses: string[];
  partners: string[];
  siblings: string[];
  isSpouse?: boolean;
  isSibling?: boolean;
}

export type TreeMap = Record<string, ActorNode>;

export const buildActorRelationTree = <
  C extends DatabaseContext & LoggerContext,
>(
  actorId: string,
  maxDepth: number,
): ReaderTaskEither<C, ServerError, TreeMap> => {
  return (ctx) => {
    const buildTree = (
      rootId: string,
      currentDepth: number,
      visited: Set<string>,
    ): TE.TaskEither<ServerError, TreeMap> => {
      if (currentDepth > maxDepth || visited.has(rootId)) {
        return TE.right({});
      }

      visited.add(rootId);

      return pipe(
        ctx.db.findOneOrFail(ActorEntity, {
          where: { id: In([rootId]) },
          relations: ["avatar"],
        }),
        TE.chain((actor) =>
          pipe(
            ctx.db.find(ActorRelationEntity, {
              where: [
                { actor: { id: In([rootId]) } },
                { relatedActor: { id: In([rootId]) } },
              ],
              relations: [
                "actor",
                "relatedActor",
                "actor.avatar",
                "relatedActor.avatar",
              ],
            }),
            TE.map((relations) => ({ actor, relations })),
          ),
        ),
        TE.chain(({ actor, relations }) => {
          const children: string[] = [];
          const spouses: string[] = [];
          const partners: string[] = [];
          const parents: string[] = [];
          const allRelatedIds: string[] = [];

          relations.forEach((rel) => {
            if (rel.type === "PARENT_CHILD") {
              if (rel.actor.id === rootId) {
                children.push(rel.relatedActor.id);
                allRelatedIds.push(rel.relatedActor.id);
              } else {
                parents.push(rel.actor.id);
                allRelatedIds.push(rel.actor.id);
              }
            } else if (rel.type === "SPOUSE") {
              const spouseId =
                rel.actor.id === rootId ? rel.relatedActor.id : rel.actor.id;
              spouses.push(spouseId);
              allRelatedIds.push(spouseId);
            } else if (rel.type === "PARTNER") {
              const partnerId =
                rel.actor.id === rootId ? rel.relatedActor.id : rel.actor.id;
              partners.push(partnerId);
              allRelatedIds.push(partnerId);
            }
          });

          const findSiblingsTE =
            parents.length > 0
              ? pipe(
                  ctx.db.find(ActorRelationEntity, {
                    where: {
                      actor: { id: In(parents) },
                      type: In(["PARENT_CHILD"]),
                    },
                    relations: ["relatedActor"],
                  }),
                  TE.map((siblingRels) =>
                    siblingRels
                      .map((r) => r.relatedActor.id)
                      .filter((id) => id !== rootId),
                  ),
                )
              : TE.right<ServerError, string[]>([]);

          return pipe(
            findSiblingsTE,
            TE.map((siblings) => ({
              actor,
              children,
              spouses,
              partners,
              siblings: Array.from(new Set(siblings)),
              allRelatedIds: Array.from(new Set(allRelatedIds)),
            })),
          );
        }),
        TE.chain(
          ({ actor, children, spouses, partners, siblings, allRelatedIds }) => {
            const currentNode: ActorNode = {
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
              children,
              spouses,
              partners,
              siblings,
            };

            const relatedTreesTE = pipe(
              allRelatedIds.concat(siblings),
              A.map((relatedId) =>
                buildTree(relatedId, currentDepth + 1, visited),
              ),
              TE.sequenceArray,
            );

            return pipe(
              relatedTreesTE,
              TE.map((relatedTrees) => {
                const mergedTree = relatedTrees.reduce(
                  (acc, tree) => ({ ...acc, ...tree }),
                  { [rootId]: currentNode } as TreeMap,
                );
                return mergedTree;
              }),
            );
          },
        ),
      );
    };

    return buildTree(actorId, 0, new Set());
  };
};
