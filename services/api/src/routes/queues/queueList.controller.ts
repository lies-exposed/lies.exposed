import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { AddEndpoint, Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import { type Router } from "express";
import * as A from "fp-ts/lib/Array.js";
import * as E from "fp-ts/lib/Either.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { toQueueIO } from "./queue.io.js";
import { type RouteContext } from "#routes/route.types.js";
import { authenticationHandler } from "#utils/authenticationHandler.js";

export const MakeQueueListRoute = (r: Router, ctx: RouteContext): void => {
  AddEndpoint(r, authenticationHandler(["admin:read"])(ctx))(
    Endpoints.Queues.List,
    ({ query: { resource, type, status } }) => {
      return pipe(
        pipe(
          ctx.queue.list({
            resource: fp.O.toUndefined(resource),
            type: fp.O.toUndefined(type),
            status: fp.O.toUndefined(status),
          }),
          TE.chainEitherK(A.traverse(E.Applicative)(toQueueIO)),
        ),
        TE.map((data) => ({
          body: { data, total: data.length },
          statusCode: 200,
        })),
      );
    },
  );
};
