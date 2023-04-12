import { AddEndpoint, Endpoints } from "@liexp/shared/lib/endpoints";
import { type Router } from "express";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { toImageIO } from "./media.io";
import { MediaEntity } from "@entities/Media.entity";
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
        TE.chain((u) =>
          ctx.db.save(MediaEntity, [
            {
              ...body,
              creator: { id: u.id },
              keywords: body.keywords.map((id) => ({ id })),
              events: body.events.map((e) => ({
                id: e,
              })),
            },
          ])
        ),
        TE.chain((results) =>
          TE.fromEither(
            toImageIO({ ...results[0], creator: results[0].creator?.id as any })
          )
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
