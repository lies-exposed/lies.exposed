import { AddEndpoint, Endpoints } from "@liexp/shared/lib/endpoints";
import { type Router } from "express";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { Equal } from "typeorm";
import { type RouteContext } from "../route.types";
import { SocialPostEntity } from "@entities/SocialPost.entity";

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
