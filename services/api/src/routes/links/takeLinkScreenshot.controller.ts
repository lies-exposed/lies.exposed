import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { AddEndpoint, Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import { uuid } from "@liexp/shared/lib/io/http/Common/UUID.js";
import { PngType } from "@liexp/shared/lib/io/http/Media/index.js";
import { AdminEdit, type User } from "@liexp/shared/lib/io/http/User.js";
import { type Router } from "express";
import * as TE from "fp-ts/lib/TaskEither.js";
import { Equal } from "typeorm";
import { LinkIO } from "./link.io.js";
import { LinkEntity } from "#entities/Link.entity.js";
import { MediaEntity } from "#entities/Media.entity.js";
import { UserEntity } from "#entities/User.entity.js";
import {
  takeLinkScreenshot,
  uploadScreenshot,
} from "#flows/links/takeLinkScreenshot.flow.js";
import {
  NotAuthorizedError,
  type ControllerError,
} from "#io/ControllerError.js";
import { type RouteContext } from "#routes/route.types.js";
import {
  RequestDecoder,
  authenticationHandler,
} from "#utils/authenticationHandler.js";

export const MakeTakeLinkScreenshotRoute = (
  r: Router,
  ctx: RouteContext,
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
            RequestDecoder.decodeNullableUser(req, [])(ctx),
            TE.fromIO,
            TE.filterOrElse(
              (user): user is User => !!user?.id,
              (e) => NotAuthorizedError(),
            ),
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
            TE.chain((linkWithMedia) =>
              pipe(
                takeLinkScreenshot(linkWithMedia)(ctx),
                TE.chain((buffer) =>
                  uploadScreenshot(linkWithMedia, buffer)(ctx),
                ),
                TE.chain((m) =>
                  ctx.db.save(MediaEntity, [
                    {
                      ...linkWithMedia.image,
                      ...m,
                      creator: user,
                    },
                  ]),
                ),
                TE.map((mm) => mm[0]),
              ),
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
