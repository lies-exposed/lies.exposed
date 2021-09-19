import { Endpoints, AddEndpoint } from "@econnessione/shared/endpoints";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/pipeable";
import { toActorIO } from "./actor.io";
import { ActorEntity } from "@entities/Actor.entity";
import { foldOptionals } from "@utils/foldOptionals.utils";
// import * as O from "fp-ts/lib/Option";
import { Route } from "routes/route.types";

export const MakeEditActorRoute: Route = (r, { db, logger }) => {
  AddEndpoint(r)(Endpoints.Actor.Edit, ({ params: { id }, body }) => {
    const updateData = foldOptionals({ ...body });
    logger.debug.log("Actor update data %O", updateData);
    return pipe(
      db.update(ActorEntity, id, updateData),
      TE.chain(() =>
        db.findOneOrFail(ActorEntity, {
          where: { id },
          loadRelationIds: true,
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
  });
};
