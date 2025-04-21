import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import * as O from "effect/Option";
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
            resource: O.getOrUndefined(resource),
            type: O.getOrUndefined(type),
            status: O.getOrUndefined(status),
          }),
          fp.TE.chainEitherK(fp.A.traverse(fp.E.Applicative)(toQueueIO)),
        ),
        fp.TE.map((data) => ({
          body: { data, total: data.length },
          statusCode: 200,
        })),
      );
    },
  );
};
