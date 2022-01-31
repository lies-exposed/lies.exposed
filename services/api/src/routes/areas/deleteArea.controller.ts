import { Endpoints, AddEndpoint } from "@econnessione/shared/endpoints";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/function";
import { Route } from "../route.types";
import { toAreaIO } from "./Area.io";
import { AreaEntity } from "@entities/Area.entity";

export const MakeDeleteAreaRoute: Route = (r, { s3, db, env }) => {
  AddEndpoint(r)(Endpoints.Area.Delete, ({ params: { id } }) => {
    return pipe(
      db.findOneOrFail(AreaEntity, {
        where: { id },
      }),
      TE.chainFirst(() => db.softDelete(AreaEntity, id)),
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
