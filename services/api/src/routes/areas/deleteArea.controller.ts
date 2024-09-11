import { pipe } from "@liexp/core/lib/fp/index.js";
import { Endpoints, AddEndpoint } from "@liexp/shared/lib/endpoints/index.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { Equal } from "typeorm";
import { type Route } from "../route.types.js";
import { AreaIO } from "./Area.io.js";
import { AreaEntity } from "#entities/Area.entity.js";

export const MakeDeleteAreaRoute: Route = (r, { db, env }) => {
  AddEndpoint(r)(Endpoints.Area.Delete, ({ params: { id } }) => {
    return pipe(
      db.findOneOrFail(AreaEntity, {
        where: { id: Equal(id) },
      }),
      TE.chainFirst(() => db.softDelete(AreaEntity, id)),
      TE.chainEitherK((a) => AreaIO.decodeSingle(a, env.SPACE_ENDPOINT)),
      TE.map((page) => ({
        body: {
          data: page,
        },
        statusCode: 200,
      })),
    );
  });
};
