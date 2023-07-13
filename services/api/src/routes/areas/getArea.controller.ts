import { Endpoints, AddEndpoint } from "@liexp/shared/lib/endpoints";
import { type Router } from "express";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { Equal } from "typeorm";
import { type RouteContext } from "../route.types";
import { toAreaIO } from "./Area.io";
import { AreaEntity } from "@entities/Area.entity";

export const MakeGetAreaRoute = (r: Router, ctx: RouteContext): void => {
  AddEndpoint(r)(Endpoints.Area.Get, ({ params: { id } }) => {
    return pipe(
      ctx.db.findOneOrFail(AreaEntity, {
        where: { id: Equal(id) },
        loadRelationIds: true,
      }),
      TE.chainEitherK(toAreaIO),
      TE.map((actor) => ({
        body: {
          data: actor,
        },
        statusCode: 200,
      })),
    );
  });
};
