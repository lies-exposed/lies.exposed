import { AddEndpoint, Endpoints } from "@econnessione/shared/endpoints";
import { sanitizeURL } from "@econnessione/shared/utils/url.utils";
import { Router } from "express";
import * as A from "fp-ts/lib/Array";
import * as E from "fp-ts/lib/Either";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/pipeable";
import { toLinkIO } from "./link.io";
import { LinkEntity } from "@entities/Link.entity";
import { ServerError } from "@io/ControllerError";
import { RouteContext } from "@routes/route.types";

export const MakeCreateLinkRoute = (r: Router, ctx: RouteContext): void => {
  AddEndpoint(r)(Endpoints.Link.Create, ({ body }) => {
    return pipe(
      ctx.urlMetadata.fetchMetadata(body.url, (e) => ServerError()),
      TE.chain((meta) =>
        ctx.db.save(LinkEntity, [
          {
            ...meta,
            title: meta.title,
            description: meta.description,
            keywords: meta.keywords ?? [],
            provider: meta.provider,
            url: sanitizeURL(body.url),
            events: body.events.map((e) => ({ id: e })),
          },
        ])
      ),
      TE.chainEitherK(A.traverse(E.Applicative)(toLinkIO)),
      TE.map(([data]) => ({
        body: { data },
        statusCode: 200,
      }))
    );
  });
};
