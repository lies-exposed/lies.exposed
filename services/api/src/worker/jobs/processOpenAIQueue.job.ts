import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { type CronJobTE } from "./cron-task.type.js";
import { getLangchainProviderFlow } from "#flows/ai/getLangchainProvider.flow.js";
import { JobProcessor } from "#flows/ai/jobProcessor.js";

export const defaultQuestion = `Can you summarize the text in 100 words maximum?`;

export const processOpenAIQueue: CronJobTE = (ctx) => (opts) => {
  ctx.logger.info.log("Start processing OpenAI queue...");
  // eslint-disable-next-line @typescript-eslint/no-floating-promises
  return pipe(
    fp.TE.Do,
    fp.TE.bind("langchain", () =>
      pipe(
        getLangchainProviderFlow(ctx),
        fp.TE.map((v) => v.langchain),
      ),
    ),
    fp.TE.bind("queue", () => ctx.queue.list()),
    fp.TE.bind("processEmbeddingJobTask", () => fp.TE.right(JobProcessor(ctx))),
    fp.TE.chain(({ queue, processEmbeddingJobTask }) => {
      return pipe(
        queue,
        fp.A.traverse(fp.TE.ApplicativePar)(processEmbeddingJobTask),
      );
    }),
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
