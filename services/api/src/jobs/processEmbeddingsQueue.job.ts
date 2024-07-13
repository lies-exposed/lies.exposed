import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { type EmbeddingJob } from "../flows/ai/EmbeddingJob.js";
// import { getLangchainProviderFlow } from "../flows/ai/getLangchainProvider.flow.js";
import { type CronJobTE } from "./cron-task.type.js";
// import { processEmbeddingJob } from "#flows/ai/processEmbeddingJob.flow.js";
import { toControllerError } from "#io/ControllerError.js";

export const defaultQuestion = `Rephrase the given text in maximum 100 words, without inventing details`;

export const processEmbeddingsQueue: CronJobTE = (ctx) => (opts) => {
  ctx.logger.info.log("Start processing embeddings queue task...");
  // eslint-disable-next-line @typescript-eslint/no-floating-promises
  return pipe(
    fp.TE.Do,
    // fp.TE.bind("langchain", () => getLangchainProviderFlow(ctx)),
    fp.TE.bind("queue", () =>
      pipe(
        ctx.queue.queue<EmbeddingJob>("openai-embedding"),
        fp.TE.right,
        fp.TE.mapLeft(toControllerError),
      ),
    ),
    fp.TE.bind("jobs", ({ queue }) => pipe(queue.listJobs({}))),
    // fp.TE.bind('processEmbeddingJobTask', ({ langchain }) => fp.TE.right(processEmbeddingJob(ctx, langchain))),
    // fp.TE.chain(({ langchain, jobs, processEmbeddingJobTask }) => {
    //   return pipe(
    //     jobs,
    //     fp.A.traverse(fp.TE.ApplicativePar)((job) => {
    //       return processEmbeddingJobTask(job);
    //     }),
    //   );
    // }),
    fp.TE.fold(
      (e) => {
        ctx.logger.error.log("Error processing embeddings queue task %O", e);
        return fp.T.of(undefined);
      },
      () => {
        ctx.logger.info.log("End processing embeddings queue task...");
        return fp.T.of(undefined);
      },
    ),
  );
};
