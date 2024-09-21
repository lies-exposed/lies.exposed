import { pipe } from "@liexp/core/lib/fp/index.js";
import { type Logger } from "@liexp/core/lib/logger/Logger.js";
import { type Task } from "fp-ts/lib/Task.js";
import Cron from "node-cron";
import { cleanTempFolder } from "./cleanTempFolder.job.js";
import { type CronFnOpts } from "./cron-task.type.js";
import { generateMissingThumbnailsCron } from "./generateMissingMedia.job.js";
import { processOpenAIQueue } from "./processOpenAIQueue.job.js";
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

  cronLogger.debug.log(
    `Setting up "SOCIAL_POST" cron task: %s`,
    ctx.env.SOCIAL_POSTING_CRON,
  );
  const postOnSocialTask = Cron.schedule(
    ctx.env.SOCIAL_POSTING_CRON,
    liftT(postOnSocialJob(ctx)),
    { runOnInit: false, scheduled: false, name: "SOCIAL_POST" },
  );

  cronLogger.debug.log(
    `Setting up "CLEAN_TEMP_FOLDER" cron task: %s`,
    ctx.env.TEMP_FOLDER_CLEAN_UP_CRON,
  );
  const cleanTempFolderTask = cleanTempFolder(ctx);

  cronLogger.debug.log(
    `Setting up "GENERATE_MISSING_THUMBNAILS" cron task: %s`,
    ctx.env.GENERATE_MISSING_THUMBNAILS_CRON,
  );
  const generateMissingThumbnailsTask = generateMissingThumbnailsCron(ctx);

  cronLogger.debug.log(
    `Setting up "PROCESS_EMBEDDINGS_QUEUE" cron task: %s`,
    ctx.env.PROCESS_QUEUE_JOB_CRON,
  );
  const processEmbeddingsQueueTask = Cron.schedule(
    ctx.env.PROCESS_QUEUE_JOB_CRON,
    liftT(processOpenAIQueue(ctx)),
    { name: "PROCESS_EMBEDDINGS_QUEUE", scheduled: false, runOnInit: false },
  );

  return {
    onBootstrap() {
      // postOnSocialTask.start();
      cleanTempFolderTask.start();
      generateMissingThumbnailsTask.start();
      // processEmbeddingsQueueTask.start();

      // Cron.getTasks().forEach((task) => {
      //   cronLogger.debug.log("New task: %s", (task as any).options.name);
      // });
    },
    onShutdown() {
      // eslint-disable-next-line no-console
      // serverLogger.debug.log(
      //   "Removing vaccine data download cron task..."
      // );
      // downloadVaccineDataTask.stop();
      cronLogger.info.log(`Removing "post on social" cron task...`);
      postOnSocialTask.stop();
      cronLogger.info.log(`Removing "clean up temp folder" cron task...`);
      cleanTempFolderTask.stop();
      cronLogger.info.log(
        `Removing "generate missing thumbnails" cron task...`,
      );
      generateMissingThumbnailsTask.stop();

      cronLogger.info.log(`Removing "process embeddings queue" cron task...`);
      processEmbeddingsQueueTask.stop();
    },
  };
};
