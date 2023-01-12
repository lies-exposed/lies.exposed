import { AddEndpoint, Endpoints } from "@liexp/shared/endpoints";
import { EventSuggestionRead } from "@liexp/shared/io/http/User";
import { parseISO } from "@liexp/shared/utils/date";
import { sanitizeURL } from "@liexp/shared/utils/url.utils";
import { LinkEntity } from "@entities/Link.entity";
import { Router } from "express";
import { ServerError } from "@io/ControllerError";
import * as A from "fp-ts/Array";
import { RouteContext } from "@routes/route.types";
import * as E from "fp-ts/Either";
import { authenticationHandler } from "@utils/authenticationHandler";
import * as TE from "fp-ts/TaskEither";
import { ensureUserExists } from "@utils/user.utils";
import { pipe } from "fp-ts/function";
import { toLinkIO } from "./link.io";

export const MakeCreateLinkRoute = (r: Router, ctx: RouteContext): void => {
  AddEndpoint(r, authenticationHandler(ctx, [EventSuggestionRead.value]))(
    Endpoints.Link.Create,
    ({ body }, req) => {
      // const data = {
      //   events: body.events.map((e) => ({ id: e })),
      // };

      ctx.logger.debug.log("Body %O", body);

      return pipe(
        ensureUserExists(req.user),
        TE.fromEither,
        TE.chain((u) =>
          pipe(
            ctx.urlMetadata.fetchMetadata(body.url, {}, (e) => ServerError()),
            TE.chain((m) =>
              ctx.db.save(LinkEntity, [
                {
                  ...m,
                  events: [],
                  title: m.title,
                  image: m.image
                    ? {
                        description: body.description ?? m.description ?? "",
                        thumbnail: m.image,
                        location: m.image,
                        type: "image/jpeg" as const,
                      }
                    : null,
                  url: sanitizeURL(m.url as any),
                  publishDate: m.date ? parseISO(m.date) : undefined,
                  description: body.description ?? m.description ?? "",
                  keywords: [],
                  creator: { id: u.id },
                },
              ])
            )
          )
        ),
        TE.chainEitherK(A.traverse(E.Applicative)(toLinkIO)),
        TE.map(([data]) => ({
          body: { data },
          statusCode: 200,
        }))
      );
    }
  );
};
