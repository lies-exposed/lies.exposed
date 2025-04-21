import { pipe } from "@liexp/core/lib/fp/index.js";
import { Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { AddEndpoint } from "#routes/endpoint.subscriber.js";
import { type Route } from "#routes/route.types.js";
import { authenticationHandler } from "#utils/authenticationHandler.js";

export const MakeQueueDeleteRoute: Route = (r, ctx) => {
  AddEndpoint(r, authenticationHandler(["admin:delete"])(ctx))(
    Endpoints.Queues.Delete,
    ({ params: { id, resource, type } }) => {
      ctx.logger.debug.log("Delete user %s ", id);
      return pipe(
        ctx.queue.queue(type).getJob(resource, id),
        TE.chainFirst(() => ctx.queue.queue(type).deleteJob(resource, id)),
        TE.map((data) => ({
          body: { data },
          statusCode: 200,
        })),
      );
    },
  );
};
