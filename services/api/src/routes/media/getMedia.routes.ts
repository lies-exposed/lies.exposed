import { AddEndpoint, Endpoints } from "@liexp/shared/lib/endpoints";
import { type Router } from "express";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { Equal } from "typeorm";
import { toImageIO } from "./media.io";
import { MediaEntity } from "@entities/Media.entity";
import { type RouteContext } from "@routes/route.types";

export const MakeGetMediaRoute = (r: Router, ctx: RouteContext): void => {
  AddEndpoint(r)(Endpoints.Media.Get, ({ params: { id } }, req) => {
    ctx.logger.debug.log("User decoded %O", req.user);

    return pipe(
      ctx.db.findOneOrFail(MediaEntity, {
        where: { id: Equal(id) },
        loadRelationIds: {
          relations: ["creator", "events", "keywords", "links"],
        },
        withDeleted: true,
      }),
      TE.chainEitherK((m) => toImageIO(m, ctx.env.SPACE_ENDPOINT)),
      TE.map((data) => ({
        body: {
          data,
        },
        statusCode: 200,
      })),
    );
  });
};
