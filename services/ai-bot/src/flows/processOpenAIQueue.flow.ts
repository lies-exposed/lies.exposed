import { LoggerService } from "@liexp/backend/lib/services/logger/logger.service.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import type * as Queue from "@liexp/io/lib/http/Queue/index.js";
import { type ClientContext } from "../context.js";
import { type ClientContextRTE } from "../types.js";
import { JobProcessor } from "./ai/jobProcessor.js";
import { toAIBotError } from "#common/error/index.js";
import {
  getAttempts,
  isStaleProcessingJob,
  MAX_JOB_ATTEMPTS,
  STALE_PROCESSING_MS,
} from "#services/job-processor/job-retry.js";

const recoverStaleJob =
  (job: Queue.Queue): ClientContextRTE<string> =>
  (ctx) => {
    const attempts = getAttempts(job) + 1;
    const giveUp = attempts >= MAX_JOB_ATTEMPTS;
    ctx.logger.warn.log(
      "Job %s (%s) stuck in processing since %s — %s (attempt %d)",
      job.id,
      job.type,
      job.updatedAt.toISOString(),
      giveUp ? "marking failed" : "re-queueing",
      attempts,
    );
    return pipe(
      ctx.api.Queues.Edit({
        Params: { id: job.id, type: job.type, resource: job.resource },
        Body: {
          ...job,
          createdAt: job.createdAt.toISOString(),
          updatedAt: new Date().toISOString(),
          deletedAt: job.deletedAt?.toISOString() ?? null,
          status: giveUp ? "failed" : "pending",
          error: {
            name: "StaleJobError",
            message: `Job was still processing after ${String(STALE_PROCESSING_MS / 60000)} minutes (worker crash or restart)`,
            status: null,
            details: [],
            failedAt: new Date().toISOString(),
            attempts,
          },
        },
      }),
      fp.TE.map(() => job.id),
      fp.TE.mapLeft(toAIBotError),
    );
  };

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
    // Orphaned "processing" jobs (ai-bot crashed/restarted mid-job) would
    // otherwise block the whole queue forever: re-queue or fail them first.
    fp.RTE.bind("recovered", ({ queue }) =>
      pipe(
        queue.data.filter((job) => isStaleProcessingJob(job)),
        fp.A.traverse(fp.RTE.ApplicativeSeq)(recoverStaleJob),
      ),
    ),
    fp.RTE.chain(({ queue, recovered }) =>
      pipe(
        queue.data.some((job) => job.status === "processing"),
        (processing) => {
          if (recovered.length > 0) {
            // Re-read the queue on the next tick so recovered jobs are
            // processed with their updated status and attempt count.
            return pipe(
              fp.RTE.right(undefined),
              LoggerService.RTE.info([
                "Recovered %d stale job(s), resuming on next tick",
                recovered.length,
              ]),
            );
          }
          if (processing) {
            return pipe(
              fp.RTE.right(undefined),
              LoggerService.RTE.info("There are jobs already processing"),
            );
          }

          const pendingJobs = pipe(
            queue.data.filter((d) => d.status === "pending"),
            fp.A.takeLeft(1),
          );

          return pipe(
            pendingJobs,
            fp.A.traverse(fp.RTE.ApplicativeSeq)((job) =>
              JobProcessor(job, dryRun),
            ),
          );
        },
      ),
    ),
    fp.RTE.map(() => undefined),
    fp.RTE.orElse((e) => (ctx) => {
      const axiosError = (e as { details?: { meta?: unknown } })?.details?.meta;
      const requestUrl: string | undefined = axiosError?.config?.url;
      const responseBody: unknown = axiosError?.response?.data;
      const httpStatus: number | undefined = axiosError?.response?.status;
      ctx.logger.error.log(
        "Error processing embeddings queue task: %s (HTTP %s)\n  URL: %s\n  Response body: %O",
        e.message,
        httpStatus ?? e.status,
        requestUrl ?? "unknown",
        responseBody ?? e.details,
      );
      const isNetworkError =
        !httpStatus || [502, 503].includes(httpStatus) || !axiosError?.response;
      if (isNetworkError) return fp.TE.left(e);
      return fp.TE.right(undefined);
    }),
  );
