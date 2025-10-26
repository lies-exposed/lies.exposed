import { authenticationHandler } from "@liexp/backend/lib/express/middleware/auth.middleware.js";
import { pipe } from "@liexp/core/lib/fp/index.js";
import { Endpoints } from "@liexp/shared/lib/endpoints/api/index.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { toQueueIO } from "./queue.io.js";
import { AddEndpoint } from "#routes/endpoint.subscriber.js";
import { type Route } from "#routes/route.types.js";

export const MakeQueueGetRoute: Route = (r, ctx) => {
  AddEndpoint(r, authenticationHandler(["admin:read"])(ctx))(
    Endpoints.Queues.Get,
    ({ params: { type, resource, id } }) => {
      return pipe(
        ctx.queue.queue(type).getJob(resource, id),
        TE.chainEitherK(toQueueIO),
        TE.map((user) => ({
          body: { data: user },
          statusCode: 200,
        })),
      );
    },
  );
};
