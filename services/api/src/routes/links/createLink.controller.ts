import { AddEndpoint, Endpoints } from "@econnessione/shared/endpoints";
import { sanitizeURL } from "@econnessione/shared/utils/url.utils";
import { LinkEntity } from "@entities/Link.entity";
import { RouteContext } from "@routes/route.types";
import { Router } from "express";
import * as A from "fp-ts/lib/Array";
import * as E from "fp-ts/lib/Either";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/pipeable";
import { toLinkIO } from "./link.io";

export const MakeCreateLinkRoute = (r: Router, ctx: RouteContext): void => {
  AddEndpoint(r)(Endpoints.Link.Create, ({ body }) => {
    const link = {
      ...body,
      url: sanitizeURL(body.url),
      events: body.events.map((e) => ({ id: e })),
    };

    return pipe(
      ctx.db.save(LinkEntity, [link]),
      TE.chainEitherK(A.traverse(E.Applicative)(toLinkIO)),
      TE.map(([data]) => ({
        body: { data },
        statusCode: 200,
      }))
    );
  });
};
