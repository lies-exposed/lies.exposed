import { AddEndpoint, Endpoints } from "@liexp/shared/endpoints";
import { sanitizeURL } from "@liexp/shared/utils/url.utils";
import { type Router } from "express";
import * as A from "fp-ts/Array";
import * as E from "fp-ts/Either";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { sequenceS } from "fp-ts/lib/Apply";
import { In } from "typeorm";
import { toLinkIO } from "./link.io";
import { LinkEntity } from "@entities/Link.entity";
import { UserEntity } from "@entities/User.entity";
import { fetchAndSave } from "@flows/link.flow";
import { type RouteContext } from "@routes/route.types";
import { authenticationHandler } from "@utils/authenticationHandler";
import { ensureUserExists } from "@utils/user.utils";

export const MakeCreateManyLinkRoute = (r: Router, ctx: RouteContext): void => {
  AddEndpoint(r, authenticationHandler(ctx, ["admin:create"]))(
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
            })
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
                return fetchAndSave(ctx)(user, b.url);
              }
              return TE.right(u);
            }),
            A.sequence(TE.ApplicativeSeq)
          );
        }),
        TE.chainEitherK(A.traverse(E.Applicative)(toLinkIO)),
        TE.map((data) => ({
          body: { data },
          statusCode: 200,
        }))
      );
    }
  );
};
