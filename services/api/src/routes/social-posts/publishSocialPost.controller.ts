import { AddEndpoint, Endpoints } from "@liexp/shared/lib/endpoints";
import { PUBLISHED } from "@liexp/shared/lib/io/http/SocialPost";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { SocialPostEntity } from "@entities/SocialPost.entity";
import { postToTG } from "@flows/events/postToTG.flow";
import { type Route } from "@routes/route.types";

export const MakePublishSocialPostRoute: Route = (r, ctx) => {
  AddEndpoint(r)(Endpoints.SocialPosts.Custom.Publish, ({ params: { id } }) => {
    return pipe(
      ctx.db.findOneOrFail(SocialPostEntity, {
        where: {
          id,
        },
      }),
      TE.chain((p) => postToTG(ctx)(id, { ...p.content })),
      ctx.logger.info.logInTaskEither(`Posting ${id} with caption %O`),
      TE.chain((result) =>
        ctx.db.save(SocialPostEntity, [
          {
            id,
            result,
            status: PUBLISHED.value,
          },
        ]),
      ),
      TE.map((data) => ({
        body: {
          data,
        },
        statusCode: 201,
      })),
    );
  });
};
