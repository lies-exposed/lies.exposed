import { endpoints, AddEndpoint } from "@econnessione/shared/endpoints";
import { AreaEntity } from "@entities/Area.entity";
import { foldOptionals } from "@utils/foldOptionals.utils";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/pipeable";
import { Route } from "routes/route.types";
import { toAreaIO } from "./Area.io";

export const MakeEditAreaRoute: Route = (r, { s3, db, env, logger }) => {
  AddEndpoint(r)(endpoints.Area.Edit, ({ params: { id }, body }) => {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    const updateData = foldOptionals(body as any);
    logger.debug.log("Actor update data %O", updateData);
    return pipe(
      db.update(AreaEntity, id, updateData),
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
  });
};
