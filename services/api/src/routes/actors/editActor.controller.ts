import { ActorEntity } from "@liexp/backend/lib/entities/Actor.entity.js";
import { ActorIO } from "@liexp/backend/lib/io/Actor.io.js";
import { foldOptionals } from "@liexp/backend/lib/utils/foldOptionals.utils.js";
import { pipe } from "@liexp/core/lib/fp/index.js";
import { Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import { UUID } from "@liexp/shared/lib/io/http/Common/index.js";
import * as A from "fp-ts/lib/Array.js";
import * as O from "fp-ts/lib/Option.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { Equal } from "typeorm";
import { type Route } from "../route.types.js";
import { AddEndpoint } from "#routes/endpoint.subscriber.js";
import { authenticationHandler } from "#utils/authenticationHandler.js";

export const MakeEditActorRoute: Route = (r, { db, logger, jwt, env }) => {
  AddEndpoint(r, authenticationHandler(["admin:create"])({ logger, jwt }))(
    Endpoints.Actor.Edit,
    ({
      params: { id },
      body: { memberIn, bornOn, diedOn, avatar, ...body },
    }) => {
      const updateData = {
        ...foldOptionals({ ...body }),
        bornOn: O.toUndefined(bornOn) as any,
        diedOn: O.toUndefined(diedOn) as any,
        avatar: pipe(
          avatar,
          O.map((a) => ({ id: a })),
          O.toUndefined,
        ),
        memberIn: pipe(
          memberIn,
          O.map(
            A.map((m) => {
              if (UUID.is(m)) {
                return {
                  id: m,
                  actor: { id },
                };
              }

              return {
                ...m,
                startDate: m.startDate,
                endDate: O.toNullable(m.endDate),
                actor: { id },
                group: { id: m.group },
              };
            }),
          ),
          O.getOrElse((): any[] => []),
        ),
      };

      logger.info.log("Actor update data %O", updateData);
      return pipe(
        db.findOneOrFail(ActorEntity, { where: { id: Equal(id) } }),
        TE.chain((actor) =>
          db.save(ActorEntity, [{ ...actor, id, ...updateData }]),
        ),
        TE.chain(() =>
          db.findOneOrFail(ActorEntity, {
            where: { id: Equal(id) },
            loadRelationIds: {
              relations: ["memberIn"],
            },
          }),
        ),
        TE.chainEitherK((a) => ActorIO.decodeSingle(a, env.SPACE_ENDPOINT)),
        TE.map((actor) => ({
          body: {
            data: actor,
          },
          statusCode: 200,
        })),
      );
    },
  );
};
