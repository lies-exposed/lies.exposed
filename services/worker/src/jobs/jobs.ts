import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import * as cronstrue from "cronstrue";
import { type Task } from "fp-ts/lib/Task.js";
import { type TaskEither } from "fp-ts/lib/TaskEither.js";
import Cron, { type ScheduledTask, type TaskContext } from "node-cron";
import { cleanTempFolder } from "./cleanTempFolder.job.js";
import { type CronJobTE } from "./cron-task.type.js";
import { processOpenAIJobsDone } from "./processOpenAIJobsDone.job.js";
import { regenerateMediaThumbnailJob } from "./regenerateMediaThumbnail.job.js";
import { postOnSocialJob } from "./socialPostScheduler.job.js";
import { type WorkerContext } from "#context/context.js";
import { toWorkerError, type WorkerError } from "#io/worker.error.js";

interface CronJobsHooks {
  onBootstrap: () => TaskEither<WorkerError, void>;
  onShutdown: () => TaskEither<WorkerError, void>;
}

const liftTask =
  (ctx: WorkerContext) =>
  (te: () => (ctx: WorkerContext) => Task<void>): (() => Promise<void>) => {
    return () => {
      return pipe(
        te()(ctx),
        fp.T.map(() => undefined),
      )();
    };
  };

const onTaskStarted =
  (logger: WorkerContext["logger"], _schedule: string) =>
  (task: TaskContext) => {
    logger.debug.log("Task %s started", task.task?.name);
  };

const taskCreator = (ctx: WorkerContext) => {
  const liftT = liftTask(ctx);

  return (schedule: string, taskTE: CronJobTE, taskName: string) => {
    const task = Cron.schedule(schedule, liftT(taskTE), {
      name: taskName,
    });

    task.on("task:started", onTaskStarted(ctx.logger, schedule));

    return task;
  };
};

export const CronJobs = (ctx: WorkerContext): CronJobsHooks => {
  const cronLogger = ctx.logger.extend("cron");

  cronLogger.info.log("Setting up cron jobs...");

  const scheduleTask = taskCreator({ ...ctx, logger: cronLogger });

  const postOnSocialTask = scheduleTask(
    ctx.env.SOCIAL_POSTING_CRON,
    postOnSocialJob,
    "SOCIAL_POSTING",
  );

  const cleanTempFolderTask = cleanTempFolder(ctx);

  const processOpenAIJobsDoneTask = scheduleTask(
    ctx.env.PROCESS_DONE_JOB_CRON,
    processOpenAIJobsDone,
    "PROCESS_DONE_JOB",
  );

  const regenerateMediaThumbnailTask = scheduleTask(
    ctx.env.REGENERATE_MEDIA_THUMBNAILS_CRON,
    regenerateMediaThumbnailJob,
    "REGENERATE_MEDIA_THUMBNAILS",
  );

  const tasksWithSchedules: [ScheduledTask, string][] = [
    [postOnSocialTask, ctx.env.SOCIAL_POSTING_CRON],
    [cleanTempFolderTask, ctx.env.TEMP_FOLDER_CLEAN_UP_CRON],
    [processOpenAIJobsDoneTask, ctx.env.PROCESS_DONE_JOB_CRON],
    [regenerateMediaThumbnailTask, ctx.env.REGENERATE_MEDIA_THUMBNAILS_CRON],
  ];

  return {
    onBootstrap() {
      cronLogger.info.log("Bootstrapping cron jobs...");
      return pipe(
        tasksWithSchedules,
        fp.A.traverse(fp.TE.ApplicativeSeq)(([task, schedule]) =>
          fp.TE.tryCatch(async () => {
            cronLogger.debug.log(
              "Task %s started with schedule %s",
              task.name,
              cronstrue.toString(schedule),
            );
            await task.start();
          }, toWorkerError),
        ),
        fp.TE.map(() => {
          cronLogger.info.log("Cron jobs started");
        }),
      );
    },
    onShutdown() {
      // stop all tasks
      return pipe(
        tasksWithSchedules,
        fp.A.traverse(fp.TE.ApplicativePar)(([task]) =>
          fp.TE.tryCatch(async () => {
            await task.stop();
          }, toWorkerError),
        ),
        fp.TE.map(() => {
          cronLogger.info.log("Cron jobs stopped");
        }),
      );
    },
  };
};
