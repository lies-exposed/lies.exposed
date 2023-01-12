import { Endpoints, AddEndpoint } from "@liexp/shared/endpoints";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { Equal } from 'typeorm';
import { Route } from "../route.types";
import { AreaEntity } from "@entities/Area.entity";
import { toAreaIO } from "./Area.io";

export const MakeDeleteAreaRoute: Route = (r, { s3, db, env }) => {
  AddEndpoint(r)(Endpoints.Area.Delete, ({ params: { id } }) => {
    return pipe(
      db.findOneOrFail(AreaEntity, {
        where: { id: Equal(id) },
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
