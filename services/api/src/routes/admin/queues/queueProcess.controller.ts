import { ProcessJobDonePubSub } from "@liexp/backend/lib/pubsub/jobs/processJobDone.pubSub.js";
import { pipe } from "@liexp/core/lib/fp/index.js";
import { Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { toQueueIO } from "./queue.io.js";
import { toControllerError } from "#io/ControllerError.js";
import { AddEndpoint } from "#routes/endpoint.subscriber.js";
import { type Route } from "#routes/route.types.js";
import { authenticationHandler } from "#utils/authenticationHandler.js";

export const MakeQueueProcessRoute: Route = (r, ctx) => {
  AddEndpoint(r, authenticationHandler(["admin:create"])(ctx))(
    Endpoints.Queues.Custom.ProcessJob,
    ({ params: { resource, type, id } }) => {
      ctx.logger.debug.log("Process queue %s %s:%s", resource, type, id);
      return pipe(
        ctx.queue.queue(type).getJob(resource, id),
        TE.filterOrElse(
          (job) => job.status === "done",
          () => toControllerError(new Error("Job not done")),
        ),
        TE.chainFirst((queue) => ProcessJobDonePubSub.publish(queue)(ctx)),
        TE.chainEitherK(toQueueIO),
        TE.map((data) => ({
          body: { data },
          statusCode: 200,
        })),
      );
    },
  );
};
