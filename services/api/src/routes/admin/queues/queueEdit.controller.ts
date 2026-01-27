import { authenticationHandler } from "@liexp/backend/lib/express/middleware/auth.middleware.js";
import { GetQueueProvider } from "@liexp/backend/lib/providers/queue.provider.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { type Queue } from "@liexp/io/lib/http/Queue/index.js";
import { Endpoints } from "@liexp/shared/lib/endpoints/api/index.js";
import { AddEndpoint } from "#routes/endpoint.subscriber.js";
import { type Route } from "#routes/route.types.js";

export const MakeQueueEditRoute: Route = (r, ctx) => {
  AddEndpoint(r, authenticationHandler(["admin:edit"])(ctx))(
    Endpoints.Queues.Edit,
    ({ params: { id, resource, type }, body: { ...userData } }) => {
      ctx.logger.debug.log("Edit queue %s  with %O", id, userData);
      return pipe(
        fp.RTE.Do,
        fp.RTE.bind("queue", () => fp.RTE.right(GetQueueProvider.queue(type))),
        fp.RTE.bind("prevJob", ({ queue }) => queue.getJob(resource, id)),
        fp.RTE.bind("deletePrevJob", ({ queue, prevJob }) =>
          queue.deleteJob(prevJob.resource, prevJob.id),
        ),
        fp.RTE.bind("job", ({ queue, prevJob }) =>
          pipe(
            fp.RTE.right({ ...prevJob, ...userData, resource } as Queue),
            fp.RTE.chainFirst(queue.addJob),
          ),
        ),
        fp.RTE.map(({ job: data }) => ({
          body: { data },
          statusCode: 200,
        })),
      )(ctx);
    },
  );
};
