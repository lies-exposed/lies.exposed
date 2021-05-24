import { endpoints, AddEndpoint } from "@econnessione/shared/endpoints";
import { ActorEntity } from "@entities/Actor.entity";
import { foldOptionals } from "@utils/foldOptionals.utils";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/pipeable";
import { Route } from "routes/route.types";
import { toActorIO } from "./actor.io";

export const MakeEditActorRoute: Route = (r, { s3, db, env, logger }) => {
  AddEndpoint(r)(endpoints.Actor.Edit, ({ params: { id }, body }) => {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    const updateData = foldOptionals(body as any);
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
