import { LoggerService } from "@liexp/backend/lib/services/logger/logger.service.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { type QueueTypes } from "@liexp/shared/lib/io/http/Queue/index.js";
import { type Queue } from "@liexp/shared/lib/io/http/index.js";
import { type ClientContextRTE } from "../../types.js";
import { type AIBotError, toAIBotError } from "#common/error/index.js";

type JobProcessors = (
  job: Queue.Queue,
  dryRun: boolean,
) => ClientContextRTE<Queue.Queue>;

export type JobProcessRTE<
  Q extends Pick<Queue.Queue, "data" | "type">,
  R = string,
> = (job: Omit<Queue.Queue, "data" | "type"> & Q) => ClientContextRTE<R>;

type JobTypesMap = {
  [K in QueueTypes]: JobProcessRTE<any, any>;
};

const processJob =
  <Q extends Pick<Queue.Queue, "type" | "data">>(
    job: Omit<Queue.Queue, "type" | "data"> & Q,
    processTE: JobProcessRTE<Q>,
  ): ClientContextRTE<Queue.Queue> =>
  (ctx) => {
    return pipe(
      fp.TE.bracket(
        pipe(
          fp.TE.right(job),
          fp.TE.chainFirst(() =>
            ctx.api.Queues.Edit({
              Params: {
                id: job.id,
                type: job.type,
                resource: job.resource,
              },
              Body: {
                ...job,
                data: {
                  ...job.data,
                  date:
                    "date" in job.data
                      ? job.data.date?.toISOString()
                      : undefined,
                } as any,
                status: "processing",
              },
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
                } as Queue.Queue),
              (result) =>
                fp.T.of({
                  ...job,
                  error: null,
                  result,
                  status: "done",
                } as Queue.Queue),
            ),
            fp.TE.fromTask<Queue.Queue, AIBotError>,
          );
        },
        (job, result) => {
          const updatedJob = pipe(
            result,
            fp.E.fold(
              (e) =>
                ({
                  ...job,
                  error: e,
                  status: "failed",
                }) as Queue.Queue,
              (r) => r,
            ),
          );

          return pipe(
            ctx.api.Queues.Edit({
              Params: {
                id: job.id,
                type: job.type,
                resource: job.resource,
              },
              Body: {
                ...(updatedJob as any),
              },
            }),
            fp.TE.map(() => undefined),
          );
        },
      ),
    );
  };

export const GetJobProcessor = (types: JobTypesMap): JobProcessors => {
  return (job: Queue.Queue, dryRun: boolean): ClientContextRTE<Queue.Queue> => {
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
