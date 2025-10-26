import { LinkEntity } from "@liexp/backend/lib/entities/Link.entity.js";
import { type MediaEntity } from "@liexp/backend/lib/entities/Media.entity.js";
import { UserEntity } from "@liexp/backend/lib/entities/User.entity.js";
import { RequestDecoder } from "@liexp/backend/lib/express/decoders/request.decoder.js";
import { authenticationHandler } from "@liexp/backend/lib/express/middleware/auth.middleware.js";
import { LinkIO } from "@liexp/backend/lib/io/link.io.js";
import { LinkPubSub } from "@liexp/backend/lib/pubsub/links/index.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { Endpoints } from "@liexp/shared/lib/endpoints/api/index.js";
import { AdminEdit } from "@liexp/shared/lib/io/http/auth/permissions/index.js";
import { type Router } from "express";
import { Equal } from "typeorm";
import { type ServerContext } from "#context/context.type.js";
import { AddEndpoint } from "#routes/endpoint.subscriber.js";

export const MakeTakeLinkScreenshotRoute = (
  r: Router,
  ctx: ServerContext,
): void => {
  AddEndpoint(r, authenticationHandler([AdminEdit.literals[0]])(ctx))(
    Endpoints.Link.Custom.TakeLinkScreenshot,
    ({ params: { id }, body }, req) => {
      ctx.logger.debug.log("Body %O", body);

      return pipe(
        fp.TE.Do,
        fp.TE.chainFirst(() =>
          pipe(
            RequestDecoder.decodeUserFromRequest(req, [])(ctx),
            fp.TE.fromIOEither,
            fp.TE.chain((user) =>
              ctx.db.findOneOrFail(UserEntity, {
                where: { id: Equal(user.id) },
              }),
            ),
          ),
        ),
        fp.TE.chain((_link) =>
          ctx.db.findOneOrFail<LinkEntity & { image?: MediaEntity }>(
            LinkEntity,
            {
              where: { id: Equal(id) },
              relations: ["image"],
            },
          ),
        ),
        fp.TE.chainFirst((link) =>
          LinkPubSub.TakeLinkScreenshot.publish({ id: link.id })(ctx),
        ),
        fp.TE.chainEitherK(LinkIO.decodeSingle),
        fp.TE.map((data) => ({
          body: { data },
          statusCode: 200,
        })),
      );
    },
  );
};
