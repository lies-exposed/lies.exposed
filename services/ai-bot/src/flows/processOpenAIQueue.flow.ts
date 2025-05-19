import { LoggerService } from "@liexp/backend/lib/services/logger/logger.service.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { type ClientContext } from "../context.js";
import { type ClientContextRTE } from "../types.js";
import { JobProcessor } from "./ai/jobProcessor.js";

export const processOpenAIQueue = (dryRun: boolean): ClientContextRTE<void> =>
  pipe(
    fp.RTE.Do,
    fp.RTE.apS(
      "queue",
      pipe(
        fp.RTE.ask<ClientContext>(),
        fp.RTE.chainTaskEitherK((ctx) =>
          ctx.api.Queues.List({
            Query: {
              resource: undefined,
              type: undefined,
              status: ["pending", "processing"],
            },
          }),
        ),
      ),
    ),
    fp.RTE.chain(({ queue }) =>
      pipe(
        queue.data.some((job) => job.status === "processing"),
        (processing) => {
          if (processing) {
            return pipe(
              fp.RTE.right(undefined),
              LoggerService.RTE.info("There are jobs already processing"),
            );
          }
          return pipe(
            queue.data,
            fp.A.traverse(fp.RTE.ApplicativeSeq)((job) =>
              JobProcessor(job, dryRun),
            ),
          );
        },
      ),
    ),
    fp.RTE.orLeft((e) => (ctx) => {
      ctx.logger.error.log("Error processing embeddings queue task %O", e);
      return fp.T.of(e);
    }),
    fp.RTE.chain(() => (ctx) => {
      ctx.logger.debug.log("End processing embeddings queue task...");
      return fp.TE.right(undefined);
    }),
  );
