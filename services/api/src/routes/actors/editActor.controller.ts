import { AddEndpoint, Endpoints } from "@liexp/shared/endpoints";
import { UUID } from "@liexp/shared/io/http/Common";
import * as A from "fp-ts/lib/Array";
import * as O from "fp-ts/lib/Option";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/function";
import { Equal } from 'typeorm';
import { Route } from "../route.types";
import { toActorIO } from "./actor.io";
import { ActorEntity } from "@entities/Actor.entity";
import { foldOptionals } from "@utils/foldOptionals.utils";

export const MakeEditActorRoute: Route = (r, { db, logger }) => {
  AddEndpoint(r)(
    Endpoints.Actor.Edit,
    ({ params: { id }, body: { memberIn, ...body } }) => {
      const updateData = {
        ...foldOptionals({ ...body }),
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
            })
          ),
          O.getOrElse((): any[] => [])
        ),
      };

      logger.info.log("Actor update data %O", updateData);
      return pipe(
        db.findOneOrFail(ActorEntity, { where: { id: Equal(id) } }),
        TE.chain((actor) =>
          db.save(ActorEntity, [{ ...actor, id, ...updateData }])
        ),
        TE.chain(() =>
          db.findOneOrFail(ActorEntity, {
            where: { id: Equal(id) },
            loadRelationIds: {
              relations: ["memberIn"],
            },
          })
        ),
        TE.chainEitherK(toActorIO),
        TE.map((actor) => ({
          body: {
            data: actor,
          },
          statusCode: 200,
        }))
      );
    }
  );
};
