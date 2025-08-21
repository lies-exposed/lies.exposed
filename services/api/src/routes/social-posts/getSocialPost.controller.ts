import { getSocialPostById } from "@liexp/backend/lib/flows/social-post/getSocialPostById.flow.js";
import { SocialPostIO } from "@liexp/backend/lib/io/socialPost.io.js";
import { LoggerService } from "@liexp/backend/lib/services/logger/logger.service.js";
import { pipe } from "@liexp/core/lib/fp/index.js";
import { Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { type Route } from "../route.types.js";
import { AddEndpoint } from "#routes/endpoint.subscriber.js";

export const MakeGetSocialPostRoute: Route = (r, ctx) => {
  AddEndpoint(r)(Endpoints.SocialPosts.Get, ({ params: { id } }) => {
    return pipe(
      getSocialPostById(id)(ctx),
      TE.chainEitherK(SocialPostIO.decodeSingle),
      LoggerService.TE.debug(ctx, "GetSocialPostRoute %O"),
      TE.map((data) => ({
        body: {
          data,
        },
        statusCode: 200,
      })),
    );
  });
};
