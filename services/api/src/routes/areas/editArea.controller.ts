import { Endpoints, AddEndpoint } from "@liexp/shared/endpoints";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/function";
import { Route } from "../route.types";
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
            where: { id },
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
