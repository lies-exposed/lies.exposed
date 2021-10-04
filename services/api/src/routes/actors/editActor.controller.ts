import { Endpoints, AddEndpoint } from "@econnessione/shared/endpoints";
import { UUID } from "@econnessione/shared/io/http/Common";
import { uuid } from "@econnessione/shared/utils/uuid";
import * as O from "fp-ts/lib/Option";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/pipeable";
import { toActorIO } from "./actor.io";
import { ActorEntity } from "@entities/Actor.entity";
import { foldOptionals } from "@utils/foldOptionals.utils";
import { Route } from "routes/route.types";

export const MakeEditActorRoute: Route = (r, { db, logger }) => {
  AddEndpoint(r)(
    Endpoints.Actor.Edit,
    ({ params: { id }, body: { memberIn, ...body } }) => {
      const updateData = {
        ...foldOptionals({ ...body }),
        memberIn: memberIn.map((m) =>
          UUID.is(m)
            ? { id: m }
            : {
                ...m,
                group: { id: m.group },
                actor: { id },
                endDate: O.toNullable(m.endDate),
                id: uuid(),
              }
        ),
      };

      logger.debug.log("Actor update data %O", updateData);
      return pipe(
        db.save(ActorEntity, [{ id, ...updateData }]),
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
    }
  );
};
