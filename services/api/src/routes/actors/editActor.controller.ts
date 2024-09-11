import { pipe } from "@liexp/core/lib/fp/index.js";
import { AddEndpoint, Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import { UUID } from "@liexp/shared/lib/io/http/Common/index.js";
import * as A from "fp-ts/lib/Array.js";
import * as O from "fp-ts/lib/Option.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { Equal } from "typeorm";
import { type Route } from "../route.types.js";
import { ActorIO } from "./actor.io.js";
import { ActorEntity } from "#entities/Actor.entity.js";
import { authenticationHandler } from "#utils/authenticationHandler.js";
import { foldOptionals } from "#utils/foldOptionals.utils.js";

export const MakeEditActorRoute: Route = (r, { db, logger, jwt }) => {
  AddEndpoint(r, authenticationHandler({ logger, jwt }, ["admin:create"]))(
    Endpoints.Actor.Edit,
    ({ params: { id }, body: { memberIn, bornOn, diedOn, ...body } }) => {
      const updateData = {
        ...foldOptionals({ ...body }),
        bornOn: O.toUndefined(bornOn) as any,
        diedOn: O.toUndefined(diedOn) as any,
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
        TE.chainEitherK(ActorIO.decodeSingle),
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
