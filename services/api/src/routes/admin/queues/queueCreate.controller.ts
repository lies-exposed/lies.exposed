import { authenticationHandler } from "@liexp/backend/lib/express/middleware/auth.middleware.js";
import { LoggerService } from "@liexp/backend/lib/services/logger/logger.service.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { Endpoints } from "@liexp/shared/lib/endpoints/api/index.js";
import {
  PendingStatus,
  type Queue,
} from "@liexp/shared/lib/io/http/Queue/index.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { toQueueIO } from "./queue.io.js";
import { AddEndpoint } from "#routes/endpoint.subscriber.js";
import { type Route } from "#routes/route.types.js";

export const MakeQueueCreateRoute: Route = (r, ctx) => {
  AddEndpoint(r, authenticationHandler(["admin:create"])(ctx))(
    Endpoints.Queues.Create,
    ({
      params: { resource, type },
      body: { id, result, question, prompt, data },
    }) => {
      return pipe(
        TE.right({
          id,
          resource,
          type,
          question: fp.O.toNullable(question),
          prompt: fp.O.toNullable(prompt),
          data,
          result: fp.O.toNullable(result),
        }),
        LoggerService.TE.debug(ctx, (job) => [
          "Create queue ( %s %s) => %O",
          resource,
          id,
          job,
        ]),
        TE.chainFirst((job) =>
          ctx.queue.queue(type).addJob({
            ...job,
            error: null,
            status: PendingStatus.literals[0],
          } as Queue),
        ),
        TE.chainEitherK(toQueueIO),
        TE.map((data) => ({
          body: { data },
          statusCode: 200,
        })),
      );
    },
  );
};
