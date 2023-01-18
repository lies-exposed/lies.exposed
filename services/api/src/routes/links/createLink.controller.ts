import { AddEndpoint, Endpoints } from "@liexp/shared/endpoints";
import { EventSuggestionRead } from "@liexp/shared/io/http/User";
import { sanitizeURL } from "@liexp/shared/utils/url.utils";
import { Router } from "express";
import * as A from "fp-ts/Array";
import * as E from "fp-ts/Either";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { toLinkIO } from "./link.io";
import { LinkEntity } from "@entities/Link.entity";
import { fetchAsLink } from "@flows/link.flow";
import { RouteContext } from "@routes/route.types";
import { authenticationHandler } from "@utils/authenticationHandler";
import { ensureUserExists } from "@utils/user.utils";

export const MakeCreateLinkRoute = (r: Router, ctx: RouteContext): void => {
  AddEndpoint(r, authenticationHandler(ctx, [EventSuggestionRead.value]))(
    Endpoints.Link.Create,
    ({ body }, req) => {

      ctx.logger.debug.log("Body %O", body);

      return pipe(
        ensureUserExists(req.user),
        TE.fromEither,
        TE.chain((u) =>
          pipe(
            fetchAsLink(ctx)(body.url, {
              description: body.description,
              type: "image/jpeg" as const,
            }),
            TE.chain((m) =>
              ctx.db.save(LinkEntity, [
                {
                  ...m,
                  events: [],
                  title: m.title,
                  url: sanitizeURL(m.url as any),
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
