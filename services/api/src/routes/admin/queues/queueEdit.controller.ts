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
    ({ params: { id, resource, type }, body: userData }) => {
      ctx.logger.debug.log("Edit queue %s  with %O", id, userData);
      return pipe(
        fp.RTE.Do,
        fp.RTE.bind("queue", () => fp.RTE.right(GetQueueProvider.queue(type))),
        fp.RTE.bind("prevJob", ({ queue }) => queue.getJob(resource, id)),
        // addJob upserts by primary key (id = prevJob.id) so this is an
        // in-place UPDATE, not an insert. No delete step: a delete-then-add
        // used to run here (leftover from the pre-Postgres, file-based queue
        // where "edit" meant delete-file-then-write-file) and left a window
        // where a crash between the two steps could drop the job permanently.
        fp.RTE.bind("job", ({ queue, prevJob }) => {
          const jobData: Omit<Queue, "createdAt" | "updatedAt" | "deletedAt"> =
            {
              ...(userData as Omit<
                Queue,
                "createdAt" | "updatedAt" | "deletedAt"
              >),
              id: prevJob.id,
              resource: prevJob.resource,
              type: prevJob.type,
            };
          return pipe(fp.RTE.right(jobData), fp.RTE.chain(queue.addJob));
        }),
        fp.RTE.map(({ job: data }) => ({
          body: { data },
          statusCode: 200,
        })),
      )(ctx);
    },
  );
};
