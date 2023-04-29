import { AddEndpoint, Endpoints } from "@liexp/shared/lib/endpoints";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { sequenceS } from "fp-ts/lib/Apply";
import { postToIG } from "@flows/events/postToIG.flow";
import { postToTG } from "@flows/events/postToTG.flow";
import { type Route } from "@routes/route.types";

export const PostSharePayloadToPlatformRoute: Route = (r, ctx) => {
  AddEndpoint(r)(
    Endpoints.Admin.Custom.PostToPlatform,
    ({ params: { id }, body: { platforms, ...body } }) => {

      return pipe(
        sequenceS(TE.ApplicativePar)({
          ig: platforms.IG
            ? postToIG(ctx)({ ...body, platforms }, () => Promise.reject(new Error('Not implemented')))
            : TE.right(undefined),
          tg: platforms.TG
            ? postToTG(ctx)(id, { ...body, platforms })
            : TE.right(undefined),
        }),
        ctx.logger.info.logInTaskEither(`Posting ${id} with caption %O`),
        TE.map((data) => ({
          body: {
            data,
          },
          statusCode: 201,
        }))
      );
    }
  );
};
