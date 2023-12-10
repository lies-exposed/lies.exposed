import { pipe } from "@liexp/core/lib/fp/index.js";
import { AddEndpoint, Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import { type Router } from "express";
import * as TE from "fp-ts/lib/TaskEither.js";
import { Equal } from "typeorm";
import { toMediaIO } from "./media.io.js";
import { MediaEntity } from "#entities/Media.entity.js";
import { type RouteContext } from "#routes/route.types.js";

export const MakeGetMediaRoute = (r: Router, ctx: RouteContext): void => {
  AddEndpoint(r)(Endpoints.Media.Get, ({ params: { id } }, req) => {
    ctx.logger.debug.log("User decoded %O", req.user);

    return pipe(
      ctx.db.findOneOrFail(MediaEntity, {
        where: { id: Equal(id) },
        loadRelationIds: {
          relations: ["creator", "events", "keywords", "links", "areas"],
        },
        withDeleted: true,
      }),
      TE.chainEitherK((m) => toMediaIO(m, ctx.env.SPACE_ENDPOINT)),
      TE.map((data) => ({
        body: {
          data,
        },
        statusCode: 200,
      })),
    );
  });
};
