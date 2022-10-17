import { AddEndpoint, Endpoints } from "@liexp/shared/endpoints";
import { sanitizeURL } from "@liexp/shared/utils/url.utils";
import { Router } from "express";
import * as A from "fp-ts/Array";
import * as E from "fp-ts/Either";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { In } from "typeorm";
import { toLinkIO } from "./link.io";
import { LinkEntity } from "@entities/Link.entity";
import { fetchAndSave } from "@flows/link.flow";
import { RouteContext } from "@routes/route.types";
import { authenticationHandler } from '@utils/authenticationHandler';

export const MakeCreateManyLinkRoute = (r: Router, ctx: RouteContext): void => {
  AddEndpoint(r, authenticationHandler(ctx, ['admin:create']))(Endpoints.Link.Custom.CreateMany, ({ body }) => {
    return pipe(
      ctx.db.find(LinkEntity, {
        where: {
          url: In(body.map((u) => u.url)),
        },
      }),
      TE.chain((ll) => {
        return pipe(
          body,
          A.map((b) => {
            const u = ll.find((l) => l.url === sanitizeURL(b.url as any));

            if (!u) {
              return fetchAndSave(ctx)(b.url);
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
  });
};
