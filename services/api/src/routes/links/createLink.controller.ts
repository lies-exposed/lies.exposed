import { fp } from "@liexp/core/lib/fp";
import { AddEndpoint, Endpoints } from "@liexp/shared/lib/endpoints";
import { EventSuggestionRead } from "@liexp/shared/lib/io/http/User";
import { sanitizeURL } from "@liexp/shared/lib/utils/url.utils";
import { type Router } from "express";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { Equal } from "typeorm";
import { toLinkIO } from "./link.io";
import { LinkEntity } from "@entities/Link.entity";
import { UserEntity } from "@entities/User.entity";
import { fetchAsLink } from "@flows/links/link.flow";
import { type RouteContext } from "@routes/route.types";
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
        TE.map((u) => {
          const c = new UserEntity();
          c.id = u.id;
          return c;
        }),
        TE.chain((u) =>
          pipe(
            ctx.db.findOne(LinkEntity, { where: { url: Equal(body.url) } }),
            TE.chain((m) => {
              if (fp.O.isSome(m)) {
                return TE.right(m.value);
              }
              return pipe(
                fetchAsLink(ctx)(u, body.url, {
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
                  ]),
                ),
                TE.map(([data]) => data),
              );
            }),
          ),
        ),
        TE.chainEitherK(toLinkIO),
        TE.map((data) => ({
          body: { data },
          statusCode: 200,
        })),
      );
    },
  );
};
