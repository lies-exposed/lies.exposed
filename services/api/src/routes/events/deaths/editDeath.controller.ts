import { AddEndpoint, Endpoints } from "@econnessione/shared/endpoints";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/pipeable";
import { Route } from "../../route.types";
import { toEventV2IO } from "../eventV2.io";
import { EventV2Entity } from "@entities/Event.v2.entity";
import { foldOptionals } from "@utils/foldOptionals.utils";

export const MakeEditDeathEventRoute: Route = (r, { db }) => {
  AddEndpoint(r)(
    Endpoints.DeathEvent.Edit,
    ({ params: { id }, body: { payload, ...body } }) => {
      const updateData = foldOptionals({ ...body });
      const updatePayloadData = foldOptionals({ ...payload });

      return pipe(
        db.findOneOrFail(EventV2Entity, { where: { id } }),
        TE.chain((event) =>
          db.save(EventV2Entity, [
            {
              ...event,
              ...updateData,
              payload: {
                ...event.payload,
                ...updatePayloadData,
              },
            },
          ])
        ),
        TE.chain(([event]) =>
          db.findOneOrFail(EventV2Entity, {
            where: { id: event.id },
            loadRelationIds: true,
          })
        ),
        TE.chainEitherK(toEventV2IO),
        TE.map((data) => ({
          body: {
            data,
          },
          statusCode: 200,
        }))
      );
    }
  );
};
