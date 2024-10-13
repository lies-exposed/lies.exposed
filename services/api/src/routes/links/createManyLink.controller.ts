import { pipe } from "@liexp/core/lib/fp/index.js";
import { AddEndpoint, Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import { sanitizeURL } from "@liexp/shared/lib/utils/url.utils.js";
import { type Router } from "express";
import { sequenceS } from "fp-ts/lib/Apply.js";
import * as A from "fp-ts/lib/Array.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { In } from "typeorm";
import { LinkIO } from "./link.io.js";
import { LinkEntity } from "#entities/Link.entity.js";
import { UserEntity } from "#entities/User.entity.js";
import { fetchAndSave } from "#flows/links/link.flow.js";
import { type RouteContext } from "#routes/route.types.js";
import { authenticationHandler } from "#utils/authenticationHandler.js";
import { ensureUserExists } from "#utils/user.utils.js";

export const MakeCreateManyLinkRoute = (r: Router, ctx: RouteContext): void => {
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
