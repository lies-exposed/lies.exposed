import { pipe } from "@liexp/core/lib/fp/index.js";
import { AddEndpoint, Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { toQueueIO } from "./queue.io.js";
import { JobProcessor } from "#flows/ai/jobProcessor.js";
import { type Route } from "#routes/route.types.js";
import { authenticationHandler } from "#utils/authenticationHandler.js";

export const MakeQueueProcessJobRoute: Route = (r, ctx) => {
  AddEndpoint(r, authenticationHandler(["admin:create"])(ctx))(
    Endpoints.Queues.Custom.ProcessJob,
    ({ params: { resource, type, id } }) => {
      ctx.logger.debug.log(
        "Process job (%s %s) from queue %s",
        resource,
        id,
        type,
      );

      return pipe(
        TE.Do,
        TE.bind("queue", () => TE.right(ctx.queue.queue(type))),
        TE.bind("job", ({ queue }) => queue.getJob(resource, id)),
        TE.chainFirst(({ job }) =>
          TE.rightIO(() => {
            void JobProcessor(ctx)(job)();
          }),
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
