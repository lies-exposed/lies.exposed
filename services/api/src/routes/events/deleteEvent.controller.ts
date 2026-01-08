import { EventV2Entity } from "@liexp/backend/lib/entities/Event.v2.entity.js";
import { RequestDecoder } from "@liexp/backend/lib/express/decoders/request.decoder.js";
import { authenticationHandler } from "@liexp/backend/lib/express/middleware/auth.middleware.js";
import { getEventById } from "@liexp/backend/lib/flows/event/getEventById.flow.js";
import { EventV2IO } from "@liexp/backend/lib/io/event/eventV2.io.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { Endpoints } from "@liexp/shared/lib/endpoints/api/index.js";
import { AdminDelete } from "@liexp/shared/lib/io/http/auth/permissions/index.js";
import { checkIsAdmin } from "@liexp/shared/lib/utils/auth.utils.js";
import { AddEndpoint } from "#routes/endpoint.subscriber.js";
import { type Route } from "#routes/route.types.js";

export const DeleteEventRoute: Route = (r, ctx) => {
  AddEndpoint(r, authenticationHandler([AdminDelete.literals[0]])(ctx))(
    Endpoints.Event.Delete,
    ({ params: { id } }, req) => {
      return pipe(
        RequestDecoder.decodeNullableUser(req, [])(ctx),
        fp.TE.fromIO,
        fp.RTE.fromTaskEither,
        fp.RTE.chain((user) =>
          getEventById(id, {
            withDeleted: user ? checkIsAdmin(user.permissions) : false,
          }),
        ),
        fp.RTE.tapTaskEither((event) =>
          event.deletedAt
            ? ctx.db.delete(EventV2Entity, id)
            : ctx.db.softDelete(EventV2Entity, id),
        ),
        fp.RTE.chainEitherK(EventV2IO.decodeSingle),
        fp.RTE.map((data) => ({
          body: {
            data,
          },
          statusCode: 200,
        })),
      )(ctx);
    },
  );
};
