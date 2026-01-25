import { type ServerError } from "@liexp/backend/lib/errors/ServerError.js";
import { authenticationHandler } from "@liexp/backend/lib/express/middleware/auth.middleware.js";
import { GetQueueProvider } from "@liexp/backend/lib/providers/queue.provider.js";
import { LoggerService } from "@liexp/backend/lib/services/logger/logger.service.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { PendingStatus, type Queue } from "@liexp/io/lib/http/Queue/index.js";
import { Endpoints } from "@liexp/shared/lib/endpoints/api/index.js";
import { type ServerContext } from "../../../context/context.type.js";
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
        fp.RTE.right<ServerContext, ServerError, Queue>({
          id,
          resource,
          type,
          question: fp.O.toNullable(question),
          prompt: fp.O.toNullable(prompt),
          data,
          error: null,
          status: PendingStatus.literals[0],
          result: fp.O.toNullable(result),
        } as Queue),
        LoggerService.RTE.debug((job) => [
          "Create queue ( %s %s) => %O",
          resource,
          id,
          job,
        ]),
        fp.RTE.chainFirst((job) =>
          GetQueueProvider.queue<Queue, ServerContext>(type).addJob(job),
        ),
        fp.RTE.map((data) => ({
          body: { data },
          statusCode: 200,
        })),
      )(ctx);
    },
  );
};
