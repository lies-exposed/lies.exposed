import { AddEndpoint, Endpoints } from "@liexp/shared/endpoints";
import { Router } from "express";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { toImageIO } from "./media.io";
import { MediaEntity } from "@entities/Media.entity";
import { RouteContext } from "@routes/route.types";
import { authenticationHandler } from "@utils/authenticationHandler";

export const MakeCreateMediaRoute = (r: Router, ctx: RouteContext): void => {
  AddEndpoint(r, authenticationHandler(ctx, []))(
    Endpoints.Media.Create,
    ({ body }, req) => {
      const id = (req.user as any).id;

      return pipe(
        ctx.db.save(MediaEntity, [
          {
            ...body,
            creator: { id },
            events: body.events.map((e) => ({
              id: e,
            })),
          },
        ]),
        TE.chain((results) => TE.fromEither(toImageIO(results[0]))),
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
