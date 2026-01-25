import { authenticationHandler } from "@liexp/backend/lib/express/middleware/auth.middleware.js";
import { QueueIO } from "@liexp/backend/lib/io/queue.io.js";
import { QueueRepository } from "@liexp/backend/lib/services/entity-repository.service.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { Endpoints } from "@liexp/shared/lib/endpoints/api/index.js";
import * as O from "effect/Option";
import { In } from "typeorm";
import { AddEndpoint } from "#routes/endpoint.subscriber.js";
import { type Route } from "#routes/route.types.js";

export const MakeQueueListRoute: Route = (r, ctx) => {
  AddEndpoint(r, authenticationHandler(["admin:read"])(ctx))(
    Endpoints.Queues.List,
    ({ query }) => {
      const resource = pipe(
        query.resource,
        O.map((r) => In([r])),
        O.getOrUndefined,
      );
      const status = pipe(query.status, O.map(In), O.getOrUndefined);
      const type = pipe(query.type, O.getOrUndefined);
      return pipe(
        QueueRepository.find({
          where: {
            resource,
            type,
            status,
          },
        }),
        fp.RTE.chainEitherK(QueueIO.decodeMany),
        fp.RTE.map((data) => ({
          body: { data, total: data.length },
          statusCode: 200,
        })),
      )(ctx);
    },
  );
};
