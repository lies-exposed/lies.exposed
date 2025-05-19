import { upsertNLPEntities as upsertNLPEntitiesFlow } from "@liexp/backend/lib/flows/admin/nlp/upsertEntities.flow.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { type CronJobTE } from "./cron-task.type.js";

export const upsertNLPEntitiesJobCron: CronJobTE = () => {
  return pipe(
    upsertNLPEntitiesFlow,
    fp.RTE.fold(
      (e) => (ctx) => {
        ctx.logger.error.log("Error processing embeddings queue task %O", e);
        return fp.T.of(undefined);
      },
      () => (ctx) => {
        ctx.logger.info.log("End processing embeddings queue task...");
        return fp.T.of(undefined);
      },
    ),
  );
};
