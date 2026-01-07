import { RequestDecoder } from "@liexp/backend/lib/express/decoders/request.decoder.js";
import { getEventById } from "@liexp/backend/lib/flows/event/getEventById.flow.js";
import { EventV2IO } from "@liexp/backend/lib/io/event/eventV2.io.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { Endpoints } from "@liexp/shared/lib/endpoints/api/index.js";
import { checkIsAdmin } from "@liexp/shared/lib/utils/auth.utils.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { type Route } from "../route.types.js";
import { AddEndpoint } from "#routes/endpoint.subscriber.js";

export const GetEventRoute: Route = (r, ctx) => {
  AddEndpoint(r)(Endpoints.Event.Get, ({ params: { id } }, req) => {
    return pipe(
      RequestDecoder.decodeNullableUser(req, [])(ctx),
      fp.TE.fromIO,
      fp.TE.chain((user) =>
        getEventById(id, {
          withDeleted: user ? checkIsAdmin(user.permissions) : false,
        })(ctx),
      ),
      TE.chainEitherK(EventV2IO.decodeSingle),
      TE.map((data) => ({
        body: {
          data,
        },
        statusCode: 200,
      })),
    );
  });
};
