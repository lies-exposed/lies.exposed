import { authenticationHandler } from "@liexp/backend/lib/express/middleware/auth.middleware.js";
import { GetQueueProvider } from "@liexp/backend/lib/providers/queue.provider.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { Endpoints } from "@liexp/shared/lib/endpoints/api/index.js";
import { AddEndpoint } from "#routes/endpoint.subscriber.js";
import { type Route } from "#routes/route.types.js";

export const MakeQueueGetRoute: Route = (r, ctx) => {
  AddEndpoint(r, authenticationHandler(["admin:read"])(ctx))(
    Endpoints.Queues.Get,
    ({ params: { type, resource, id } }) => {
      return pipe(
        GetQueueProvider.queue(type).getJob(resource, id),
        fp.RTE.map((user) => ({
          body: { data: user },
          statusCode: 200,
        })),
      )(ctx);
    },
  );
};
