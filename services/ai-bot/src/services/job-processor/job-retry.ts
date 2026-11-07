import type * as Queue from "@liexp/io/lib/http/Queue/index.js";
import {
  type AIBotError,
  type JobError,
  toJobError,
} from "#common/error/index.js";

/** Max times a job is re-queued after a transient failure or a stale run. */
export const MAX_JOB_ATTEMPTS = 3;

/**
 * A job still `processing` after this long is assumed orphaned (the ai-bot
 * process crashed or was restarted mid-job). Jobs run sequentially, so a
 * healthy run never holds a job this long.
 */
export const STALE_PROCESSING_MS = 30 * 60 * 1000;

export type JobErrorWithAttempts = JobError & { attempts: number };

/** Number of previous attempts, persisted on `job.error.attempts`. */
export const getAttempts = (job: Pick<Queue.Queue, "error">): number => {
  const attempts = (job.error as { attempts?: unknown } | null)?.attempts;
  return typeof attempts === "number" && attempts >= 0 ? attempts : 0;
};

const TRANSIENT_ERROR_PATTERN =
  /ECONNREFUSED|ECONNRESET|ETIMEDOUT|EAI_AGAIN|ENOTFOUND|socket hang up|Network Error|timeout of \d+ms exceeded/i;

/**
 * Errors caused by an unavailable dependency (agent/API restarting, DNS not
 * yet resolvable) rather than by the job itself: retrying later can succeed.
 */
const isTransientError = (e: AIBotError): boolean => {
  const status = Number(e.status);
  if ([502, 503, 504].includes(status)) return true;
  const details = Array.isArray(e.details) ? e.details.join("\n") : "";
  return TRANSIENT_ERROR_PATTERN.test(`${e.message}\n${details}`);
};

/**
 * Status + error to store for a failed run: transient failures go back to
 * `pending` until MAX_JOB_ATTEMPTS is reached, everything else fails.
 */
export const failedJobUpdate = (
  job: Pick<Queue.Queue, "error">,
  e: AIBotError,
): { status: "pending" | "failed"; error: JobErrorWithAttempts } => {
  const attempts = getAttempts(job) + 1;
  const retry = isTransientError(e) && attempts < MAX_JOB_ATTEMPTS;
  return {
    status: retry ? "pending" : "failed",
    error: { ...toJobError(e), attempts },
  };
};

export const isStaleProcessingJob = (
  job: Pick<Queue.Queue, "status" | "updatedAt">,
  now: Date = new Date(),
): boolean =>
  job.status === "processing" &&
  now.getTime() - job.updatedAt.getTime() > STALE_PROCESSING_MS;
