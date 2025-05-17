import { LoggerService } from "@liexp/backend/lib/services/logger/logger.service.js";
import { fp } from "@liexp/core/lib/fp/index.js";
import {
  type QueueResourceNames,
  type QueueTypes,
} from "@liexp/shared/lib/io/http/Queue/index.js";
import { throwTE } from "@liexp/shared/lib/utils/task.utils.js";
import { pipe } from "fp-ts/lib/function.js";
import { JobProcessor } from "../flows/ai/jobProcessor.js";
import { type CommandFlow } from "./CommandFlow.js";

export const processJobCommand: CommandFlow = async (ctx, args) => {
  return pipe(
    ctx.api.Queues.Get({
      Params: {
        type: args[0] as QueueTypes,
        resource: args[1] as QueueResourceNames,
        id: args[2],
      },
    }),
    fp.TE.chain((job) => JobProcessor(job.data, false)(ctx)),
    LoggerService.TE.debug(ctx, "Job processed %O"),
    fp.TE.map((job) => undefined),
    throwTE,
  );
};
