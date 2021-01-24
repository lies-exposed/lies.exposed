import { endpoints } from "@econnessione/shared";
import { Router } from "express";
import { sequenceS } from "fp-ts/lib/Apply";
import * as A from "fp-ts/lib/Array";
import * as E from "fp-ts/lib/Either";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/pipeable";
import { RouteContext } from "routes/route.types";
import { AddEndpoint } from "ts-endpoint-express";
import { EventEntity } from "./event.entity";
import { toEventIO } from "./event.io";

export const MakeListEventRoute = (r: Router, ctx: RouteContext): void => {
  AddEndpoint(r)(endpoints.Event.List, () => {
    return pipe(
      sequenceS(TE.taskEither)({
        data: pipe(
          ctx.db.find(EventEntity, { relations: ["links", "images"] }),
          TE.chainEitherK(A.traverse(E.either)(toEventIO))
        ),
        total: ctx.db.count(EventEntity),
      }),
      TE.map(({ data, total }) => ({
        body: {
          data,
          total,
        } as any,
        statusCode: 200,
      }))
    );
  });
};
