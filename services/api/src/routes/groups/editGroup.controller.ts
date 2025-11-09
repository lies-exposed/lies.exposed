import { authenticationHandler } from "@liexp/backend/lib/express/middleware/auth.middleware.js";
import { pipe } from "@liexp/core/lib/fp/index.js";
import { Endpoints } from "@liexp/shared/lib/endpoints/api/index.js";
import * as O from "effect/Option";
import * as TE from "fp-ts/lib/TaskEither.js";
import { editGroup } from "#flows/groups/editGroup.flow.js";
import { AddEndpoint } from "#routes/endpoint.subscriber.js";
import { type Route } from "#routes/route.types.js";

export const MakeEditGroupRoute: Route = (r, ctx) => {
  AddEndpoint(r, authenticationHandler(["admin:edit"])(ctx))(
    Endpoints.Group.Edit,
    ({
      params: { id },
      body: { members, avatar, startDate, endDate, excerpt, body, ...rest },
    }) => {
      ctx.logger.debug.log("Updating group with id %s", id);

      return pipe(
        editGroup({
          id,
          name: rest.name,
          username: rest.username,
          color: rest.color,
          kind: rest.kind,
          excerpt: pipe(
            excerpt,
            O.map((e) => e as any),
          ),
          body: pipe(
            body,
            O.map((b) => b as any),
          ),
          avatar,
          startDate: pipe(
            startDate,
            O.map((d) => d.toISOString()),
          ),
          endDate: pipe(
            endDate,
            O.map((d) => d.toISOString()),
          ),
          members: pipe(
            members,
            O.map((m) => m as any),
          ),
        })(ctx),
        TE.map((data) => ({
          body: {
            data,
          },
          statusCode: 200,
        })),
      );
    },
  );
};
