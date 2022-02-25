import { Endpoints, AddEndpoint } from "@liexp/shared/endpoints";
import { Router } from "express";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/function";
import { RouteContext } from "../route.types";
import { toAreaIO } from "./Area.io";
import { AreaEntity } from "@entities/Area.entity";
import { NotFoundError } from "@io/ControllerError";

export const MakeGetAreaRoute = (r: Router, ctx: RouteContext): void => {
  AddEndpoint(r)(Endpoints.Area.Get, ({ params: { id } }) => {
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
