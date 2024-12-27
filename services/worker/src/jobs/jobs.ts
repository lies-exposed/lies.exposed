import { pipe } from "@liexp/core/lib/fp/index.js";
import * as cronstrue from "cronstrue";
import { type Task } from "fp-ts/lib/Task.js";
import Cron from "node-cron";
import { cleanTempFolder } from "./cleanTempFolder.job.js";
import { type CronFnOpts } from "./cron-task.type.js";
import { generateMissingThumbnailsCron } from "./generateMissingMedia.job.js";
import { processOpenAIJobsDone } from "./processOpenAIJobsDone.job.js";
import { regenerateMediaThumbnailJob } from "./regenerateMediaThumbnail.job.js";
import { postOnSocialJob } from "./socialPostScheduler.job.js";
import { type WorkerContext } from "#context/context.js";

interface CronJobsHooks {
  onBootstrap: () => void;
  onShutdown: () => void;
}

const liftTask =
  (ctx: WorkerContext) =>
  <T>(
    te: (opts: CronFnOpts) => (ctx: WorkerContext) => Task<T>,
  ): ((opts: CronFnOpts) => void) => {
    return (opts) => {
      void pipe(te(opts)(ctx))();
    };
  };

export const CronJobs = (ctx: WorkerContext): CronJobsHooks => {
  const cronLogger = ctx.logger.extend("cron");

  Cron.getTasks().forEach((task) => {
    cronLogger.debug.log("Removing existing task: %O", task);
    task.stop();
  });

  const liftT = liftTask({ ...ctx, logger: cronLogger });
  cronLogger.info.log("Setting up cron jobs...");

  const postOnSocialTask = Cron.schedule(
    ctx.env.SOCIAL_POSTING_CRON,
    liftT(postOnSocialJob),
    { runOnInit: false, scheduled: false, name: "SOCIAL_POSTING" },
  );

  const cleanTempFolderTask = cleanTempFolder(ctx);
  const generateMissingThumbnailsTask = generateMissingThumbnailsCron(ctx);

  const processOpenAIJobsDoneTask = Cron.schedule(
    ctx.env.PROCESS_DONE_JOB_CRON,
    liftT(processOpenAIJobsDone),
    { name: "PROCESS_DONE_JOB", scheduled: false, runOnInit: false },
  );

  const regenerateMediaThumbnailTask = Cron.schedule(
    ctx.env.REGENERATE_MEDIA_THUMBNAILS_CRON,
    liftT(regenerateMediaThumbnailJob),
    { name: "REGENERATE_MEDIA_THUMBNAILS", scheduled: true, runOnInit: false },
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
      processOpenAIJobsDoneTask.start();
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
