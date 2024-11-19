import { LoggerService } from "@liexp/backend/lib/services/logger/logger.service.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { type QueueTypes } from "@liexp/shared/lib/io/http/Queue.js";
import { type Queue } from "@liexp/shared/lib/io/http/index.js";
import { type ClientContextRTE } from "../../types.js";
import { toAIBotError } from "#common/error/index.js";
import { type EmbeddingJob } from "#flows/ai/EmbeddingJob.js";

type JobProcessors = (
  job: EmbeddingJob,
  dryRun: boolean,
) => ClientContextRTE<EmbeddingJob>;

export type JobProcessRTE = (job: EmbeddingJob) => ClientContextRTE<string>;

type JobTypesMap = {
  [K in QueueTypes]: JobProcessRTE;
};

const processJob =
  (
    job: EmbeddingJob,
    processTE: JobProcessRTE,
  ): ClientContextRTE<EmbeddingJob> =>
  (ctx) => {
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
            processTE(job)(ctx),
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
  };

export const GetJobProcessor = (types: JobTypesMap): JobProcessors => {
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
      fp.RTE.chain(() => (ctx) => {
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

        return processJob(job, types[job.type])(ctx);
      }),
    );
  };
};
