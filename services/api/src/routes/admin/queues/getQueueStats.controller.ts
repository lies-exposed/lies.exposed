import { authenticationHandler } from "@liexp/backend/lib/express/middleware/auth.middleware.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { Endpoints } from "@liexp/shared/lib/endpoints/api/index.js";
import { type ServerContext } from "#context/context.type.js";
import { getQueueAdminStatsFlow } from "#flows/admin/queues/getQueueAdminStats.flow.js";
import { AddEndpoint } from "#routes/endpoint.subscriber.js";
import { type Route } from "#routes/route.types.js";

export const MakeAdminGetQueueStatsRoute: Route = (r, ctx) => {
  AddEndpoint(r, authenticationHandler(["admin:read"])(ctx))(
    Endpoints.Admin.Custom.GetQueueStats,
    () => {
      return pipe(
        fp.RTE.ask<ServerContext>(),
        fp.RTE.chainTaskEitherK(getQueueAdminStatsFlow()),
        fp.RTE.map(({ total, failed, pending, processing, completed }) => ({
          body: {
            failed,
            pending,
            processing,
            completed,
            total,
          },
          statusCode: 201,
        })),
      )(ctx);
    },
  );
};
