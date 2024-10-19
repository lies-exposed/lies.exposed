import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { type CronJobTE } from "./cron-task.type.js";
import { type ServerContext } from "#context/context.type.js";
import { getLangchainProviderFlow } from "#flows/ai/getLangchainProvider.flow.js";
import { JobProcessor } from "#flows/ai/jobProcessor.js";

export const defaultQuestion = `Can you summarize the text in 100 words maximum?`;

export const processOpenAIQueue: CronJobTE = (opts) => {
  return pipe(
    fp.RTE.Do,
    // fp.RTE.apS('logger', () => {
    //   logger.info.log("Start processing OpenAI queue...");
    // }),
    fp.RTE.apS(
      "langchain",
      pipe(
        getLangchainProviderFlow,
        fp.RTE.map((v) => v.langchain),
      ),
    ),
    fp.RTE.apS(
      "queue",
      pipe(
        fp.RTE.ask<ServerContext>(),
        fp.RTE.chainTaskEitherK((ctx) => ctx.queue.list()),
      ),
    ),
    fp.RTE.chain(({ queue }) => {
      return pipe(queue, fp.A.traverse(fp.RTE.ApplicativePar)(JobProcessor));
    }),
    fp.RTE.fold(
      (e) => (ctx) => {
        ctx.logger.error.log("Error processing embeddings queue task %O", e);
        return fp.T.of(undefined);
      },
      () => (ctx) => {
        ctx.logger.info.log("End processing embeddings queue task...");
        return fp.T.of(undefined);
      },
    ),
  );
};
