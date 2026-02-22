import { QueueEntity } from "@liexp/backend/lib/entities/Queue.entity.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { sequenceS } from "fp-ts/lib/Apply.js";
import { type TEReader } from "#flows/flow.types.js";

const getQueueCountByStatus =
  (
    status: "failed" | "pending" | "processing" | "completed",
  ): TEReader<number> =>
  (ctx) => {
    return pipe(
      ctx.db.execQuery(() => {
        return ctx.db.manager
          .createQueryBuilder(QueueEntity, "queue")
          .where("queue.status = :status", { status })
          .getCount();
      }),
    );
  };

const getTotalQueues = (): TEReader<number> => (ctx) => {
  return pipe(
    ctx.db.execQuery(() => {
      return ctx.db.manager.createQueryBuilder(QueueEntity, "queue").getCount();
    }),
  );
};

export const getQueueAdminStatsFlow = (): TEReader<{
  total: number;
  failed: number;
  pending: number;
  processing: number;
  completed: number;
}> => {
  return pipe(
    sequenceS(fp.RTE.ApplicativePar)({
      total: getTotalQueues(),
      failed: getQueueCountByStatus("failed"),
      pending: getQueueCountByStatus("pending"),
      processing: getQueueCountByStatus("processing"),
      completed: getQueueCountByStatus("completed"),
    }),
  );
};
