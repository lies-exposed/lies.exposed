import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import * as A from "fp-ts/lib/Array.js";
import * as E from "fp-ts/lib/Either.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { toQueueIO } from "./queue.io.js";
import { AddEndpoint } from "#routes/endpoint.subscriber.js";
import { type Route } from "#routes/route.types.js";
import { authenticationHandler } from "#utils/authenticationHandler.js";

export const MakeQueueListRoute: Route = (r, ctx) => {
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
