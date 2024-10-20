import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { type ClientContextRTE } from "./types.js";
import { JobProcessor } from "#flows/ai/jobProcessor.js";
import { type ClientContext } from "context.js";

export const defaultQuestion = `Can you summarize the text in 100 words maximum?`;

export const processOpenAIQueue = (dryRun: boolean): ClientContextRTE<void> =>
  pipe(
    fp.RTE.Do,
    fp.RTE.apS(
      "queue",
      pipe(
        fp.RTE.ask<ClientContext>(),
        fp.RTE.chainTaskEitherK((ctx) =>
          ctx.endpointsRESTClient.Endpoints.Queues.getList({
            filter: {
              resource: undefined,
              type: undefined,
              status: "pending",
            },
          }),
        ),
      ),
    ),
    fp.RTE.chain(({ queue }) => {
      return pipe(
        queue.data,
        fp.A.traverse(fp.RTE.ApplicativeSeq)((job) =>
          JobProcessor(job, dryRun),
        ),
      );
    }),
    fp.RTE.orLeft((e) => (ctx) => {
      ctx.logger.error.log("Error processing embeddings queue task %O", e);
      return fp.T.of(e);
    }),
    fp.RTE.chain(() => (ctx) => {
      ctx.logger.info.log("End processing embeddings queue task...");
      return fp.TE.right(undefined);
    }),
  );
