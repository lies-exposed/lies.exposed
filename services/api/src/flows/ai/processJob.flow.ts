import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { type QueueTypes } from "@liexp/shared/lib/io/http/Queue.js";
import { type Queue } from "@liexp/shared/lib/io/http/index.js";
import { type TaskEither } from "fp-ts/lib/TaskEither.js";
import { defaultQuestion } from "../../worker/jobs/processOpenAIQueue.job.js";
import { getLangchainProviderFlow } from "./getLangchainProvider.flow.js";
import { loadDocs } from "./loadDocs.flow.js";
import { type EmbeddingJob } from "#flows/ai/EmbeddingJob.js";
import { type ControllerError } from "#io/ControllerError.js";
import {
  type LangchainProvider,
  type LangchainDocument,
} from "#providers/ai/langchain.provider.js";
import { type RouteContext } from "#routes/route.types.js";

type JobProcessors = (
  ctx: RouteContext,
) => (job: EmbeddingJob) => TaskEither<ControllerError, EmbeddingJob>;

type JobTypesMap = {
  [K in QueueTypes]: (
    langchain: LangchainProvider,
    docs: LangchainDocument[],
    question: string,
  ) => TaskEither<ControllerError, string>;
};

export const GetJobProcessors = (types: JobTypesMap): JobProcessors => {
  return (ctx: RouteContext) =>
    (job: EmbeddingJob): TaskEither<ControllerError, EmbeddingJob> => {
      ctx.logger.debug.log("Process embedding job %s", job.id);
      return pipe(
        fp.TE.Do,
        fp.TE.bind("queue", () => fp.TE.right(ctx.queue.queue(job.type))),
        fp.TE.bind("job", ({ queue }) =>
          pipe(
            queue.getJob(job.resource, job.id),
            fp.TE.tap(() => queue.updateJob(job, "processing")),
          ),
        ),
        fp.TE.bind("docs", ({ job }) => loadDocs(job)(ctx)),
        fp.TE.bind("langchain", () => getLangchainProviderFlow(ctx)),
        fp.TE.chain(({ queue, job, langchain: { langchain }, docs }) => {
          const processTE = types[job.type];
          return pipe(
            fp.TE.bracket(
              fp.TE.right(job),
              (job) =>
                pipe(
                  processTE(
                    langchain,
                    docs,
                    job.data.question ?? defaultQuestion,
                  ),
                  fp.TE.map((result) => ({
                    ...job,
                    data: { ...job.data, result: result },
                    error: null,
                  })),
                ),
              (job, result) => {
                const updateJobsParams: [EmbeddingJob, Queue.Status] =
                  fp.E.isLeft(result)
                    ? [{ ...job, error: result.left }, "failed"]
                    : [{ ...result.right, error: null }, "completed"];

                return pipe(queue.updateJob(...updateJobsParams));
              },
            ),
          );
        }),
      );
    };
};
