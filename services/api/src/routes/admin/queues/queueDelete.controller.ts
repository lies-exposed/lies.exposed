import { authenticationHandler } from "@liexp/backend/lib/express/middleware/auth.middleware.js";
import { GetQueueProvider } from "@liexp/backend/lib/providers/queue.provider.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { Endpoints } from "@liexp/shared/lib/endpoints/api/index.js";
import { AddEndpoint } from "#routes/endpoint.subscriber.js";
import { type Route } from "#routes/route.types.js";

export const MakeQueueDeleteRoute: Route = (r, ctx) => {
  AddEndpoint(r, authenticationHandler(["admin:delete"])(ctx))(
    Endpoints.Queues.Delete,
    ({ params: { id, resource, type } }) => {
      ctx.logger.debug.log("Delete queue %s ", id);
      return pipe(
        GetQueueProvider.queue(type).getJob(resource, id),
        fp.RTE.chainFirst(() =>
          GetQueueProvider.queue(type).deleteJob(resource, id),
        ),
        fp.RTE.map((data) => ({
          body: { data },
          statusCode: 200,
        })),
      )(ctx);
    },
  );
};
