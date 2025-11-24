import { authenticationHandler } from "@liexp/backend/lib/express/middleware/auth.middleware.js";
import { editArea } from "@liexp/backend/lib/flows/areas/editArea.flow.js";
import { pipe } from "@liexp/core/lib/fp/index.js";
import { Endpoints } from "@liexp/shared/lib/endpoints/api/index.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { type Route } from "../route.types.js";
import { toControllerError } from "#io/ControllerError.js";
import { AddEndpoint } from "#routes/endpoint.subscriber.js";

export const MakeEditAreaRoute: Route = (r, ctx) => {
  AddEndpoint(r, authenticationHandler(["admin:edit"])(ctx))(
    Endpoints.Area.Edit,
    ({ params: { id }, body: { media, events, updateGeometry, ...body } }) => {
      ctx.logger.debug.log("Area update data %O", { ...body, media });

      return pipe(
        editArea({
          id,
          ...body,
          media,
          events,
          updateGeometry,
        })(ctx),
        TE.mapLeft(toControllerError),
        TE.map((area) => ({
          body: {
            data: area,
          },
          statusCode: 200,
        })),
      );
    },
  );
};
