import { pipe } from "@liexp/core/lib/fp/index.js";
import { AddEndpoint, Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import { AdminCreate } from "@liexp/shared/lib/io/http/User.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { createScientificStudy } from "#flows/events/scientific-studies/createScientificStudy.flow.js";
import { EventV2IO } from "#routes/events/eventV2.io.js";
import { type Route } from "#routes/route.types.js";
import { authenticationHandler } from "#utils/authenticationHandler.js";

export const MakeCreateScientificStudyRoute: Route = (r, ctx) => {
  AddEndpoint(r, authenticationHandler([AdminCreate.value])(ctx))(
    Endpoints.ScientificStudy.Create,
    ({ body }, req) => {
      return pipe(
        createScientificStudy(body, req)(ctx),
        TE.chainEitherK(EventV2IO.decodeSingle),
        TE.map((data) => ({
          body: {
            data,
          },
          statusCode: 201,
        })),
      );
    },
  );
};
