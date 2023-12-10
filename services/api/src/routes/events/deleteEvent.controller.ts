import { pipe } from "@liexp/core/lib/fp/index.js";
import { AddEndpoint, Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import { AdminDelete } from "@liexp/shared/lib/io/http/User.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { EventV2Entity } from "#entities/Event.v2.entity.js";
import { type Route } from "#routes/route.types.js";
import { authenticationHandler } from "#utils/authenticationHandler.js";

export const DeleteEventRoute: Route = (r, { db, logger, jwt }) => {
  AddEndpoint(r, authenticationHandler({ jwt, logger }, [AdminDelete.value]))(
    Endpoints.Event.Delete,
    ({ params: { id } }) => {
      return pipe(
        db.softDelete(EventV2Entity, id),
        TE.map((data) => ({
          body: {
            data: true,
          },
          statusCode: 200,
        })),
      );
    },
  );
};
