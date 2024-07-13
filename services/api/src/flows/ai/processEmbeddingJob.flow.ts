import { fp, pipe } from "@liexp/core/lib/fp/index.js";
// import { type Queue } from "@liexp/shared/lib/io/http/index.js";
import { type TaskEither } from "fp-ts/lib/TaskEither.js";
// import { loadLink } from "./loadLink.flow.js";
// import { loadPDF } from "./loadPDF.flow.js";
import { type EmbeddingJob } from "#flows/ai/EmbeddingJob.js";
import {
  type ControllerError,
} from "#io/ControllerError.js";
// import { defaultQuestion } from "#jobs/processEmbeddingsQueue.job.js";
// import { type LangchainProvider } from "#providers/ai/langchain.provider.js";
import { type RouteContext } from "#routes/route.types.js";

export const processEmbeddingJob =
  (ctx: RouteContext) =>
  (
    job: EmbeddingJob,
  ): TaskEither<ControllerError, EmbeddingJob> => {
    ctx.logger.debug.log("Process embedding job %s", job.id);
    return pipe(
      fp.TE.Do,
      fp.TE.bind("queue", () =>
        fp.TE.right(ctx.queue.queue("openai-embedding")),
      ),
      fp.TE.bind("job", ({ queue }) =>
        pipe(
          queue.getJob(job.resource, job.id),
          fp.TE.tap(() => queue.updateJob(job, "processing")),
        ),
      ),
      // fp.TE.bind("docs", ({ job }) => {
      //   if (job.resource === "media") {
      //     return loadPDF(ctx)(job.data.url);
      //   }

      //   return loadLink(ctx)(job.data.url);
      // }),
      // fp.TE.chain(({ queue, job, docs }) => {
      //   return pipe(
      //     fp.TE.bracket(
      //       fp.TE.right(job),
      //       (job) =>
      //         pipe(
      //           fp.TE.tryCatch(async () => {
      //           return langchain.queryDocument(
      //             docs,
      //             job.data.question ?? defaultQuestion,
      //           );
      //         }, toControllerError),
      //         fp.TE.map((result) => ({ ...job, data: { ...job.data, result: result }  }))
      //       ),
      //       (job, result) => {
      //         const updateJobsParams: [EmbeddingJob, Queue.Status] = fp.E.isLeft(result)
      //           ? [{ ...job, error: result.left }, "failed"]
      //           : [
      //               result.right,
      //               "completed",
      //             ];

      //         return pipe(
      //           queue.updateJob(...updateJobsParams),
      //         );
      //       },
      //     ),
      //   );
      // }),
      fp.TE.map(({ job }) => job)
    );
  };
