import { pipe } from "@liexp/core/lib/fp/index.js";
import { Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { Equal } from "typeorm";
import { type Route } from "../route.types.js";
import { SocialPostEntity } from "#entities/SocialPost.entity.js";
import { AddEndpoint } from "#routes/endpoint.subscriber.js";

export const MakeGetSocialPostRoute: Route = (r, ctx) => {
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
