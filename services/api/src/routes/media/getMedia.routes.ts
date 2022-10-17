import { AddEndpoint, Endpoints } from "@liexp/shared/endpoints";
import { Router } from "express";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { Equal } from 'typeorm';
import { toImageIO } from "./media.io";
import { MediaEntity } from "@entities/Media.entity";
import { RouteContext } from "@routes/route.types";

export const MakeGetMediaRoute = (r: Router, ctx: RouteContext): void => {
  AddEndpoint(r)(Endpoints.Media.Get, ({ params: { id } }) => {
    return pipe(
      ctx.db.findOneOrFail(MediaEntity, {
        where: { id: Equal(id) },
        loadRelationIds: {
          relations: ['links', "events"],
        },
      }),
      TE.chain((result) => TE.fromEither(toImageIO(result))),
      TE.map((data) => ({
        body: {
          data,
        },
        statusCode: 200,
      }))
    );
  });
};
