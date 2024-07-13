import { pipe } from "@liexp/core/lib/fp/index.js";
import { AddEndpoint, Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import * as TE from "fp-ts/lib/TaskEither.js";
// import { toQueueIO } from "./queue.io.js";
// import { getLangchainProviderFlow } from "#flows/ai/getLangchainProvider.flow.js";
// import { processEmbeddingJob } from "#flows/ai/processEmbeddingJob.flow.js";
import { type Route } from "#routes/route.types.js";
import { authenticationHandler } from "#utils/authenticationHandler.js";

export const MakeQueueProcessJobRoute: Route = (r, ctx) => {
  AddEndpoint(r, authenticationHandler(ctx, ["admin:create"]))(
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
        // TE.bind("queue", () => TE.right(ctx.queue.queue(type))),
        // TE.bind("job", ({ queue }) => queue.getJob(resource, id)),
        // TE.bind("langchain", () => getLangchainProviderFlow(ctx)),
        // TE.chainFirst(({ queue, job, langchain }) =>
        //   TE.rightIO(() => {
        //     // do not wait the job to be processed
        //     void processEmbeddingJob(ctx, langchain)(job)();
        //   }),
        // ),
        // TE.chainEitherK(({ job }) => toQueueIO(job)),
        TE.map(() => ({ data: "ok" })),
        TE.map((data) => ({
          body: { data },
          statusCode: 200,
        })),
      );
    },
  );
};
