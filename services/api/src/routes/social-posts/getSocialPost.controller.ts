import { pipe } from "@liexp/core/lib/fp/index.js";
import { AddEndpoint, Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import { type Router } from "express";
import * as TE from "fp-ts/lib/TaskEither.js";
import { Equal } from "typeorm";
import { type RouteContext } from "../route.types.js";
import { SocialPostEntity } from "#entities/SocialPost.entity.js";

export const MakeGetSocialPostRoute = (r: Router, ctx: RouteContext): void => {
  AddEndpoint(r)(Endpoints.SocialPosts.Get, ({ params: { id } }) => {
    return pipe(
      ctx.db.findOneOrFail(SocialPostEntity, {
        where: {
          id: Equal(id),
        },
      }),
      TE.map((data) => ({
        body: {
          data,
        },
        statusCode: 200,
      })),
    );
  });
};
