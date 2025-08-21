import { LinkEntity } from "@liexp/backend/lib/entities/Link.entity.js";
import { LinkIO } from "@liexp/backend/lib/io/link.io.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import { checkIsAdmin } from "@liexp/shared/lib/utils/user.utils.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { Equal } from "typeorm";
import { type Route } from "../route.types.js";
import { AddEndpoint } from "#routes/endpoint.subscriber.js";
import { RequestDecoder } from "#utils/authenticationHandler.js";

export const MakeGetLinksRoute: Route = (r, ctx) => {
  AddEndpoint(r)(Endpoints.Link.Get, ({ params: { id } }, req) => {
    const isAdmin = pipe(
      RequestDecoder.decodeNullableUser(req, [])(ctx),
      fp.IO.map((u) => (u ? checkIsAdmin(u.permissions) : false)),
    )();
    return pipe(
      ctx.db.findOneOrFail(LinkEntity, {
        where: { id: Equal(id) },
        relations: ["image"],
        loadRelationIds: { relations: ["events", "keywords", "creator"] },
        withDeleted: isAdmin,
      }),
      TE.chainEitherK((l) => LinkIO.decodeSingle(l)),
      TE.map((data) => ({
        body: { data },
        statusCode: 200,
      })),
    );
  });
};
