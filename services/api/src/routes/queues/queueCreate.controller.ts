import { pipe } from "@liexp/core/lib/fp/index.js";
import { AddEndpoint, Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { toQueueIO } from "./queue.io.js";
import { type Route } from "#routes/route.types.js";
import { authenticationHandler } from "#utils/authenticationHandler.js";

export const MakeQueueCreateRoute: Route = (r, ctx) => {
  AddEndpoint(r, authenticationHandler(["admin:create"])(ctx))(
    Endpoints.Queues.Create,
    ({ params: { resource, type }, body: { id, data } }) => {
      ctx.logger.debug.log("Create queue ( %s %s) => %O", resource, id, data);
      return pipe(
        TE.right({ id, resource, type, data }),
        TE.chainFirst((job) =>
          ctx.queue.queue(type).addJob({
            ...job,
            error: null,
            status: "pending",
          }),
        ),
        TE.chainEitherK(toQueueIO),
        TE.map((data) => ({
          body: { data },
          statusCode: 200,
        })),
      );
    },
  );
};
