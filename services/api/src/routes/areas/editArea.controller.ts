import { Endpoints, AddEndpoint } from "@liexp/shared/lib/endpoints";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { Equal } from 'typeorm';
import { type Route } from "../route.types";
import { toAreaIO } from "./Area.io";
import { AreaEntity } from "@entities/Area.entity";
import { foldOptionals } from "@utils/foldOptionals.utils";

export const MakeEditAreaRoute: Route = (r, { db, env, logger }) => {
  AddEndpoint(r)(
    Endpoints.Area.Edit,
    ({ params: { id }, body: { media, events, ...body } }) => {
      logger.debug.log("Area update data %O", { ...body, media });

      const updateData = {
        ...foldOptionals({ ...body }),
        media: media.map((id) => ({ id })),
        events: events.map((id) => ({ id })),
        id,
      };

      return pipe(
        db.save(AreaEntity, [updateData]),
        TE.chain(() =>
          db.findOneOrFail(AreaEntity, {
            where: { id: Equal(id) },
            loadRelationIds: true,
          })
        ),
        TE.chainEitherK(toAreaIO),
        TE.map((page) => ({
          body: {
            data: page,
          },
          statusCode: 200,
        }))
      );
    }
  );
};
