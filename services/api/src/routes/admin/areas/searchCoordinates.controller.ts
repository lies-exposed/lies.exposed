import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import { uuid } from "@liexp/shared/lib/io/http/Common/UUID.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { AddEndpoint } from "#routes/endpoint.subscriber.js";
import { type Route } from "#routes/route.types.js";
import { authenticationHandler } from "#utils/authenticationHandler.js";

export const MakeAdminSearchAreaCoordinatesRoute: Route = (r, ctx) => {
  AddEndpoint(r, authenticationHandler(["admin:create"])(ctx))(
    Endpoints.Admin.Custom.SearchAreaCoordinates,
    ({ body: { label: _label } }) => {
      return pipe(
        // TODO: use pub sub
        // fetchCoordinates(label)(ctx),
        TE.right(fp.O.none),
        TE.map((geo) =>
          pipe(
            geo,
            fp.O.getOrElse(() => ({})),
          ),
        ),
        TE.map((coords) => ({
          body: { data: { id: uuid(), ...coords } },
          statusCode: 201,
        })),
      );
    },
  );
};
