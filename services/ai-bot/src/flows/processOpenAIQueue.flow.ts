import { LoggerService } from "@liexp/backend/lib/services/logger/logger.service.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { type ClientContext } from "../context.js";
import { type ClientContextRTE } from "../types.js";
import { JobProcessor } from "./ai/jobProcessor.js";

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
    fp.RTE.chain(({ queue }) =>
      pipe(
        queue.data.some((job) => job.status === "processing"),
        (processing) => {
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
      const axiosError = (e as any)?.details?.meta;
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
      return fp.TE.right(undefined);
    }),
  );
