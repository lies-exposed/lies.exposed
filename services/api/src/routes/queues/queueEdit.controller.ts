import { pipe } from "@liexp/core/lib/fp/index.js";
import { AddEndpoint, Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { toQueueIO } from "./queue.io.js";
import { type Route } from "#routes/route.types.js";
import { authenticationHandler } from "#utils/authenticationHandler.js";

export const MakeQueueEditRoute: Route = (r, ctx) => {
  AddEndpoint(r, authenticationHandler(ctx, ["admin:edit"]))(
    Endpoints.Queues.Edit,
    ({ params: { id, resource, type }, body: { ...userData } }) => {
      ctx.logger.debug.log("Edit setting %s  with %O", id, userData);
      return pipe(
        ctx.queue.queue(type).addJob({ ...userData, resource }),
        TE.chainEitherK((job) => toQueueIO(job)),
        TE.map((data) => ({
          body: { data },
          statusCode: 200,
        })),
      );
    },
  );
};
