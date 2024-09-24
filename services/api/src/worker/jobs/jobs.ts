import { pipe } from "@liexp/core/lib/fp/index.js";
import { type Logger } from "@liexp/core/lib/logger/Logger.js";
import * as cronstrue from "cronstrue";
import { type Task } from "fp-ts/lib/Task.js";
import Cron from "node-cron";
import { cleanTempFolder } from "./cleanTempFolder.job.js";
import { type CronFnOpts } from "./cron-task.type.js";
import { generateMissingThumbnailsCron } from "./generateMissingMedia.job.js";
import { processOpenAIQueue } from "./processOpenAIQueue.job.js";
import { regenerateMediaThumbnailJob } from "./regenerateMediaThumbnail.job.js";
import { postOnSocialJob } from "./socialPostScheduler.job.js";
import { type RouteContext } from "#routes/route.types.js";

interface CronJobsHooks {
  onBootstrap: () => void;
  onShutdown: () => void;
}

const liftTask =
  (logger: Logger) =>
  <T>(te: (opts: CronFnOpts) => Task<T>): ((opts: CronFnOpts) => void) => {
    return (opts) => {
      void pipe(te(opts))();
    };
  };

export const CronJobs = (ctx: RouteContext): CronJobsHooks => {
  const cronLogger = ctx.logger.extend("cron");

  Cron.getTasks().forEach((task) => {
    cronLogger.debug.log("Removing existing task: %O", task);
    task.stop();
  });

  const liftT = liftTask(cronLogger);

  cronLogger.info.log("Setting up cron jobs...");

  const postOnSocialTask = Cron.schedule(
    ctx.env.SOCIAL_POSTING_CRON,
    liftT(postOnSocialJob(ctx)),
    { runOnInit: false, scheduled: false, name: "SOCIAL_POSTING" },
  );

  const cleanTempFolderTask = cleanTempFolder(ctx);
  const generateMissingThumbnailsTask = generateMissingThumbnailsCron(ctx);

  const processEmbeddingsQueueTask = Cron.schedule(
    ctx.env.PROCESS_QUEUE_JOB_CRON,
    liftT(processOpenAIQueue(ctx)),
    { name: "PROCESS_QUEUE_JOB", scheduled: false, runOnInit: false },
  );

  const regenerateMediaThumbnailTask = Cron.schedule(
    ctx.env.REGENERATE_MEDIA_THUMBNAILS_CRON,
    liftT(regenerateMediaThumbnailJob(ctx)),
    { name: "REGENERATE_MEDIA_THUMBNAILS", scheduled: true, runOnInit: true },
  );

  return {
    onBootstrap() {
      Cron.getTasks().forEach((task) => {
        const taskName = (task as any).options.name;
        const envCron = (ctx.env as any)[`${taskName}_CRON`];
        cronLogger.info.log(
          "New task %s scheduled at %s (%s)",
          taskName,
          envCron,
          cronstrue.toString(envCron),
        );
      });

      postOnSocialTask.start();
      cleanTempFolderTask.start();
      generateMissingThumbnailsTask.start();
      regenerateMediaThumbnailTask.start();
      processEmbeddingsQueueTask.stop();
    },
    onShutdown() {
      // stop all tasks
      Cron.getTasks().forEach((task) => {
        const taskName = (task as any).options.name;
        cronLogger.info.log(`Removing "${taskName}" cron task...`);
        task.stop();
      });
    },
  };
};
