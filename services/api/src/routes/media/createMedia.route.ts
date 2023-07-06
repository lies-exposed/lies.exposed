import { AddEndpoint, Endpoints } from "@liexp/shared/lib/endpoints";
import { type Router } from "express";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { Equal } from "typeorm";
import { toImageIO } from "./media.io";
import { MediaEntity } from "@entities/Media.entity";
import { createThumbnail } from "@flows/media/createThumbnail.flow";
import { type RouteContext } from "@routes/route.types";
import { authenticationHandler } from "@utils/authenticationHandler";
import { ensureUserExists } from "@utils/user.utils";

export const MakeCreateMediaRoute = (r: Router, ctx: RouteContext): void => {
  AddEndpoint(r, authenticationHandler(ctx, []))(
    Endpoints.Media.Create,
    ({ body }, req) => {
      return pipe(
        ensureUserExists(req.user),
        TE.fromEither,
        ctx.logger.error.logInTaskEither("User %O"),
        TE.chain((u) =>
          pipe(
            ctx.db.save(MediaEntity, [
              {
                ...body,
                creator: u.id as any,
                keywords: body.keywords.map((id) => ({ id })),
                events: body.events.map((e) => ({
                  id: e,
                })),
              },
            ]),
            TE.chain(([result]) =>
              pipe(
                ctx.db.findOneOrFail(MediaEntity, {
                  where: { id: Equal(result.id) },
                  loadRelationIds: {
                    relations: ["creator"],
                  },
                }),
                TE.chain((media) =>
                  pipe(
                    createThumbnail(ctx)(media),
                    TE.map((thumbnail) => ({ ...media, thumbnail })),
                    TE.chainFirst((m) => ctx.db.save(MediaEntity, [m]))
                  )
                )
              )
            )
          )
        ),
        TE.chain((media) =>
          TE.fromEither(toImageIO(media, ctx.env.SPACE_ENDPOINT))
        ),
        TE.map((data) => ({
          body: {
            data,
          },
          statusCode: 200,
        }))
      );
    }
  );
};
