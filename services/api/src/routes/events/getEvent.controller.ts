import { endpoints } from "@econnessione/shared";
import { Router } from "express";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/pipeable";
import { RouteContext } from "routes/route.types";
import { AddEndpoint } from "ts-endpoint-express";
import { EventEntity } from "./event.entity";
import { toEventIO } from "./event.io";

export const MakeGetEventRoute = (r: Router, ctx: RouteContext): void => {
  AddEndpoint(r)(endpoints.Event.Get, ({ params: { id } }) => {
    return pipe(
      ctx.db.findOneOrFail(EventEntity, {
        where: { id },
        relations: ["links", "images"],
        loadRelationIds: {
          relations: ["actors"],
        },
      }),
      TE.chainEitherK(toEventIO),
      TE.map((data) => ({
        body: {
          data,
        },
        statusCode: 200,
      }))
    );
  });
};
