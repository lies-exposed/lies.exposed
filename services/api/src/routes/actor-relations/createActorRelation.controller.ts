import { ActorEntity } from "@liexp/backend/lib/entities/Actor.entity.js";
import { ActorRelationEntity } from "@liexp/backend/lib/entities/ActorRelation.entity.js";
import { toBadRequestError } from "@liexp/backend/lib/errors/BadRequestError.js";
import { authenticationHandler } from "@liexp/backend/lib/express/middleware/auth.middleware.js";
import { ActorRelationIO } from "@liexp/backend/lib/io/actorRelation.io.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { Endpoints } from "@liexp/shared/lib/endpoints/api/index.js";
import * as O from "effect/Option";
import * as TE from "fp-ts/lib/TaskEither.js";
import { Equal } from "typeorm";
import { type Route } from "../route.types.js";
import { AddEndpoint } from "#routes/endpoint.subscriber.js";

export const MakeCreateActorRelationRoute: Route = (
  r,
  { db, logger, jwt, s3: _s3 },
) => {
  AddEndpoint(r, authenticationHandler(["admin:create"])({ logger, jwt }))(
    Endpoints.ActorRelation.Create,
    ({ body }) => {
      const saveData = {
        ...body,
        actor: { id: body.actor },
        relatedActor: { id: body.relatedActor },
        startDate: O.getOrNull(body.startDate),
        endDate: O.getOrNull(body.endDate),
        excerpt: O.getOrNull(body.excerpt),
      };
      return pipe(
        TE.Do,
        TE.chain(() =>
          pipe(
            db.findOne(ActorEntity, { where: { id: Equal(body.actor) } }),
            TE.chain(
              fp.O.fold(
                () =>
                  TE.left(
                    toBadRequestError(`Actor ${body.actor} does not exist`),
                  ),
                () => TE.right(undefined),
              ),
            ),
          ),
        ),
        TE.chain(() =>
          pipe(
            db.findOne(ActorEntity, {
              where: { id: Equal(body.relatedActor) },
            }),
            TE.chain(
              fp.O.fold(
                () =>
                  TE.left(
                    toBadRequestError(
                      `Actor ${body.relatedActor} does not exist`,
                    ),
                  ),
                () => TE.right(undefined),
              ),
            ),
          ),
        ),
        TE.chain(() =>
          pipe(
            db.findOne(ActorRelationEntity, {
              where: {
                actor: { id: body.actor },
                type: body.type,
                relatedActor: { id: body.relatedActor },
              },
            }),
            TE.chain(
              fp.O.fold(
                () => TE.right(undefined),
                () =>
                  TE.left(
                    toBadRequestError(
                      `A ${body.type} relation between actor ${body.actor} and actor ${body.relatedActor} already exists`,
                    ),
                  ),
              ),
            ),
          ),
        ),
        TE.chain(() =>
          body.type === "PARENT_CHILD"
            ? pipe(
                db.findOne(ActorRelationEntity, {
                  where: {
                    actor: { id: body.relatedActor },
                    type: body.type,
                    relatedActor: { id: body.actor },
                  },
                }),
                TE.chain(
                  fp.O.fold(
                    () => TE.right(undefined),
                    () =>
                      TE.left(
                        toBadRequestError(
                          `Creating this relation would form a cycle: actor ${body.relatedActor} is already a parent of ${body.actor}`,
                        ),
                      ),
                  ),
                ),
              )
            : TE.right(undefined),
        ),
        TE.chain(() => db.save(ActorRelationEntity, [saveData])),
        TE.chain(([relation]) =>
          db.findOneOrFail(ActorRelationEntity, {
            where: { id: Equal(relation.id) },
            relations: ["actor", "relatedActor"],
          }),
        ),
        TE.chainEitherK((ar) => ActorRelationIO.decodeSingle(ar)),
        TE.map((data) => ({
          body: {
            data,
          },
          statusCode: 201,
        })),
      );
    },
  );
};
