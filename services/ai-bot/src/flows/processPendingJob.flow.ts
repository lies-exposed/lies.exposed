import { type LoggerContext } from "@liexp/backend/lib/context/index.js";
import {
  type LangchainProvider,
  type LangchainDocument,
} from "@liexp/backend/lib/providers/ai/langchain.provider.js";
import { LoggerService } from "@liexp/backend/lib/services/logger/logger.service.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { type QueueTypes } from "@liexp/shared/lib/io/http/Queue.js";
import { type Queue } from "@liexp/shared/lib/io/http/index.js";
import { type TaskEither } from "fp-ts/lib/TaskEither.js";
import { toAIBotError, type AIBotError } from "../common/error/index.js";
import { loadDocs } from "./ai/loadDocs.flow.js";
import { defaultQuestion } from "./processOpenAIQueue.flow.js";
import { type ClientContextRTE } from "./types.js";
import { type EmbeddingJob } from "#flows/ai/EmbeddingJob.js";

type JobProcessors = (
  job: EmbeddingJob,
  dryRun: boolean,
) => ClientContextRTE<EmbeddingJob>;

type JobTypesMap = {
  [K in QueueTypes]: (
    langchain: LangchainProvider,
    docs: LangchainDocument[],
    question: string,
    opts?: { model?: string },
  ) => TaskEither<AIBotError, string>;
};

export const GetJobProcessors = (types: JobTypesMap): JobProcessors => {
  return (
    job: EmbeddingJob,
    dryRun: boolean,
  ): ClientContextRTE<EmbeddingJob> => {
    return pipe(
      fp.RTE.Do,
      LoggerService.RTE.debug([
        "Processing job (%s) %s: %O",
        job.type,
        job.id,
        job.data,
      ]),
      fp.RTE.bind("docs", () => {
        if (dryRun) {
          return pipe(
            fp.RTE.ask<LoggerContext>(),
            LoggerService.RTE.debug([
              "Dry run, skipping loading docs for job %s",
              job.id,
            ]),
            fp.RTE.map(() => []),
          );
        }

        return loadDocs(job);
      }),
      fp.RTE.chain(({ docs }) => (ctx) => {
        const processTE = types[job.type];

        if (dryRun) {
          return pipe(
            fp.TE.right(job),
            LoggerService.TE.debug(ctx, [
              "Dry run, skipping job %s (%s)",
              job.id,
              job.type,
            ]),
          );
        }

        return pipe(
          fp.TE.bracket(
            pipe(
              fp.TE.right(job),
              fp.TE.chainFirst(() =>
                ctx.endpointsRESTClient.Endpoints.Queues.edit({
                  ...job,
                  status: "processing",
                }),
              ),
            ),
            (job) => {
              return pipe(
                processTE(
                  ctx.langchain,
                  docs,
                  job.data.question ?? defaultQuestion,
                  {
                    model:
                      job.type === "openai-embedding"
                        ? ctx.config.config.localAi.models?.embeddings
                        : ctx.config.config.localAi.models?.summarization,
                  },
                ),
                LoggerService.TE.debug(ctx, (result) => [
                  `Job %s updated %O`,
                  job.id,
                  result,
                ]),
                fp.TE.filterOrElse(
                  (r) => !!r,
                  () => toAIBotError(new Error("No results returned")),
                ),
                fp.TE.fold(
                  (e) =>
                    fp.T.of({
                      ...job,
                      error: e,
                      status: "failed",
                    } as EmbeddingJob),
                  (result) =>
                    fp.T.of({
                      ...job,
                      data: { ...job.data, result },
                      status: "done",
                    } as EmbeddingJob),
                ),
                fp.TE.fromTask,
              );
            },
            (job, result) => {
              const updatedJob = pipe(
                result,
                fp.E.fold(
                  (e) => ({
                    ...job,
                    error: e,
                    status: "failed" as Queue.Status,
                  }),
                  (r) => r,
                ),
              );

              return pipe(
                ctx.endpointsRESTClient.Endpoints.Queues.edit({
                  ...updatedJob,
                }),
                fp.TE.map(() => undefined),
              );
            },
          ),
        );
      }),
    );
  };
};
