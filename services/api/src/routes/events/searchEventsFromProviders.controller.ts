import { getOneAdminOrFail } from "@liexp/backend/lib/flows/user/getOneUserOrFail.flow.js";
import { LinkPubSub } from "@liexp/backend/lib/pubsub/links/index.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import { type Router } from "express";
import * as TE from "fp-ts/lib/TaskEither.js";
import { type ServerContext } from "#context/context.type.js";
import { toControllerError } from "#io/ControllerError.js";
import { AddEndpoint } from "#routes/endpoint.subscriber.js";

export const SearchEventsFromProviderRoute = (
  r: Router,
  ctx: ServerContext,
): void => {
  AddEndpoint(r)(
    Endpoints.Event.Custom.SearchEventsFromProvider,
    ({ body: { query, page, date, providers, keywords } }) => {
      ctx.logger.debug.log("Query %O", { query, providers, keywords, date });

      return pipe(
        getOneAdminOrFail(ctx),
        TE.chainFirst(() =>
          LinkPubSub.SearchLinks.publish({
            providers,
            page,
            query: query,
            keywords,
            date: fp.O.toUndefined(date),
          })(ctx),
        ),
        TE.mapLeft(toControllerError),
        TE.map(() => ({
          body: {
            data: [],
            total: 0,
          },
          statusCode: 200,
        })),
      );
    },
  );
};
