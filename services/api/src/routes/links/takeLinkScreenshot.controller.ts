import { LinkEntity } from "@liexp/backend/lib/entities/Link.entity.js";
import { type MediaEntity } from "@liexp/backend/lib/entities/Media.entity.js";
import { UserEntity } from "@liexp/backend/lib/entities/User.entity.js";
import { takeLinkScreenshotAndSave } from "@liexp/backend/lib/flows/links/takeLinkScreenshot.flow.js";
import { LinkIO } from "@liexp/backend/lib/io/link.io.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import { uuid } from "@liexp/shared/lib/io/http/Common/UUID.js";
import { PngType } from "@liexp/shared/lib/io/http/Media/index.js";
import { AdminEdit } from "@liexp/shared/lib/io/http/User.js";
import { type Router } from "express";
import * as TE from "fp-ts/lib/TaskEither.js";
import { Equal } from "typeorm";
import { type ServerContext } from "#context/context.type.js";
import { type ControllerError } from "#io/ControllerError.js";
import { AddEndpoint } from "#routes/endpoint.subscriber.js";
import {
  RequestDecoder,
  authenticationHandler,
} from "#utils/authenticationHandler.js";

export const MakeTakeLinkScreenshotRoute = (
  r: Router,
  ctx: ServerContext,
): void => {
  AddEndpoint(r, authenticationHandler([AdminEdit.value])(ctx))(
    Endpoints.Link.Custom.TakeLinkScreenshot,
    ({ params: { id }, body }, req) => {
      ctx.logger.debug.log("Body %O", body);

      const getMediaOrMakeFromLinkTask = (
        link: LinkEntity,
      ): TE.TaskEither<ControllerError, Partial<MediaEntity>[]> =>
        pipe(
          fp.O.fromNullable<Partial<MediaEntity> | null>(link.image),
          fp.O.map(fp.A.of),
          fp.O.getOrElse((): Partial<MediaEntity>[] => [
            {
              id: uuid(),
              label: link.title,
              description: link.description ?? link.title,
              type: PngType.value,
            },
          ]),
          TE.right,
        );

      return pipe(
        TE.Do,
        TE.bind("user", () =>
          pipe(
            RequestDecoder.decodeUserFromRequest(req, [])(ctx),
            TE.fromIOEither,
            TE.chain((user) =>
              ctx.db.findOneOrFail(UserEntity, {
                where: { id: Equal(user.id) },
              }),
            ),
          ),
        ),
        TE.bind("link", () =>
          ctx.db.findOneOrFail(LinkEntity, {
            where: { id: Equal(id) },
            relations: ["image"],
          }),
        ),
        TE.bind("media", ({ user, link }) =>
          pipe(
            getMediaOrMakeFromLinkTask(link),
            TE.map(([media]) => ({ ...link, image: media as any })),
            // TODO: use pub sub
            TE.chain((linkWithMedia) =>
              takeLinkScreenshotAndSave(linkWithMedia)(ctx),
            ),
          ),
        ),
        TE.map(({ media, link }) => ({ link: { ...link, media } })),
        TE.chainEitherK(({ link }) => LinkIO.decodeSingle(link)),
        TE.map((data) => ({
          body: { data },
          statusCode: 200,
        })),
      );
    },
  );
};
