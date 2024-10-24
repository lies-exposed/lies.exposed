import { pipe } from "@liexp/core/lib/fp/index.js";
import { Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { toQueueIO } from "./queue.io.js";
import { AddEndpoint } from "#routes/endpoint.subscriber.js";
import { type Route } from "#routes/route.types.js";
import { authenticationHandler } from "#utils/authenticationHandler.js";

export const MakeQueueEditRoute: Route = (r, ctx) => {
  AddEndpoint(r, authenticationHandler(["admin:edit"])(ctx))(
    Endpoints.Queues.Edit,
    ({ params: { id, resource, type }, body: { ...userData } }) => {
      ctx.logger.debug.log("Edit setting %s  with %O", id, userData);
      return pipe(
        TE.Do,
        TE.bind("queue", () => TE.right(ctx.queue.queue(type))),
        TE.bind("prevJob", ({ queue }) => queue.getJob(resource, id)),
        TE.bind("deletePrevJob", ({ queue, prevJob }) =>
          queue.deleteJob(prevJob.resource, prevJob.id),
        ),
        TE.bind("job", ({ queue, prevJob }) =>
          pipe(
            TE.right({ ...prevJob, ...userData, resource }),
            TE.chainFirst(queue.addJob),
          ),
        ),
        TE.chainEitherK(({ job }) => toQueueIO(job)),
        TE.map((data) => ({
          body: { data },
          statusCode: 200,
        })),
      );
    },
  );
};
