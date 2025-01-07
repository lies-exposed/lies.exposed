import { LinkEntity } from "@liexp/backend/lib/entities/Link.entity.js";
import { UserEntity } from "@liexp/backend/lib/entities/User.entity.js";
import { LinkIO } from "@liexp/backend/lib/io/link.io.js";
import { pipe } from "@liexp/core/lib/fp/index.js";
import { Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import { sanitizeURL } from "@liexp/shared/lib/utils/url.utils.js";
import { sequenceS } from "fp-ts/lib/Apply.js";
import * as A from "fp-ts/lib/Array.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { In } from "typeorm";
import { fetchAndSave } from "#flows/links/link.flow.js";
import { AddEndpoint } from "#routes/endpoint.subscriber.js";
import { type Route } from "#routes/route.types.js";
import { authenticationHandler } from "#utils/authenticationHandler.js";
import { ensureUserExists } from "#utils/user.utils.js";

export const MakeCreateManyLinkRoute: Route = (r, ctx) => {
  AddEndpoint(r, authenticationHandler(["admin:create"])(ctx))(
    Endpoints.Link.Custom.CreateMany,
    ({ body }, req) => {
      return pipe(
        sequenceS(TE.ApplicativePar)({
          user: pipe(
            ensureUserExists(req.user),
            TE.fromEither,
            TE.map((u) => {
              const c = new UserEntity();
              c.id = u.id;
              return c;
            }),
          ),
          links: ctx.db.find(LinkEntity, {
            where: {
              url: In(body.map((u) => u.url)),
            },
          }),
        }),
        TE.chain(({ user, links }) => {
          return pipe(
            body,
            A.map((b) => {
              const u = links.find((l) => l.url === sanitizeURL(b.url as any));

              if (!u) {
                return fetchAndSave(user, b.url)(ctx);
              }
              return TE.right(u);
            }),
            A.sequence(TE.ApplicativeSeq),
          );
        }),
        TE.chainEitherK(LinkIO.decodeMany),
        TE.map((data) => ({
          body: { data },
          statusCode: 200,
        })),
      );
    },
  );
};
