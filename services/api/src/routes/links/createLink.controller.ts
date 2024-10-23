import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import { EventSuggestionRead } from "@liexp/shared/lib/io/http/User.js";
import { sanitizeURL } from "@liexp/shared/lib/utils/url.utils.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { Equal } from "typeorm";
import { LinkIO } from "./link.io.js";
import { LinkEntity } from "#entities/Link.entity.js";
import { UserEntity } from "#entities/User.entity.js";
import { fetchAsLink } from "#flows/links/link.flow.js";
import { AddEndpoint } from "#routes/endpoint.subscriber.js";
import { type Route } from "#routes/route.types.js";
import { authenticationHandler } from "#utils/authenticationHandler.js";
import { ensureUserExists } from "#utils/user.utils.js";

export const MakeCreateLinkRoute: Route = (r, ctx) => {
  AddEndpoint(r, authenticationHandler([EventSuggestionRead.value])(ctx))(
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
                fetchAsLink(u, body.url, {
                  description: body.description,
                  type: "image/jpeg" as const,
                })(ctx),
                TE.chain((m) =>
                  ctx.db.save(LinkEntity, [
                    {
                      ...m,
                      events: [],
                      title: m.title,
                      url: sanitizeURL(m.url),
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
        TE.chainEitherK(LinkIO.decodeSingle),
        TE.map((data) => ({
          body: { data },
          statusCode: 200,
        })),
      );
    },
  );
};
