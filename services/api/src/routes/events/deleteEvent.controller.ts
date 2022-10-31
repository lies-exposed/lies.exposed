import { AddEndpoint, Endpoints } from "@liexp/shared/endpoints";
import { AdminDelete } from '@liexp/shared/io/http/User';
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { EventV2Entity } from "@entities/Event.v2.entity";
import { Route } from "@routes/route.types";
import { authenticationHandler } from "@utils/authenticationHandler";

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
        }))
      );
    }
  );
};
