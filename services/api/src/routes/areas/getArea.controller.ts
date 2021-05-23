import { endpoints, AddEndpoint } from "@econnessione/shared/endpoints";
import { AreaEntity } from "@entities/Area.entity";
import { NotFoundError } from "@io/ControllerError";
import { Router } from "express";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/pipeable";
import { RouteContext } from "routes/route.types";
import { toAreaIO } from "./Area.io";

export const MakeGetAreaRoute = (r: Router, ctx: RouteContext): void => {
  AddEndpoint(r)(endpoints.Area.Get, ({ params: { id } }) => {
    return pipe(
      ctx.db.findOneOrFail(AreaEntity, {
        where: { id },
        loadRelationIds: true,
      }),
      TE.mapLeft(() => NotFoundError("Area")),
      TE.chainEitherK(toAreaIO),
      TE.map((actor) => ({
        body: {
          data: actor,
        },
        statusCode: 200,
      }))
    );
  });
};
