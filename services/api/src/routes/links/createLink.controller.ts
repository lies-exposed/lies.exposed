import { AddEndpoint, Endpoints } from "@liexp/shared/endpoints";
import { parseISO } from "@liexp/shared/utils/date";
import { sanitizeURL } from "@liexp/shared/utils/url.utils";
import { Router } from "express";
import * as A from "fp-ts/lib/Array";
import * as E from "fp-ts/lib/Either";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/function";
import { toLinkIO } from "./link.io";
import { LinkEntity } from "@entities/Link.entity";
import { ServerError } from "@io/ControllerError";
import { RouteContext } from "@routes/route.types";
import { authenticationHandler } from '@utils/authenticationHandler';

export const MakeCreateLinkRoute = (r: Router, ctx: RouteContext): void => {
  AddEndpoint(r, authenticationHandler(ctx, ['admin:create']))(Endpoints.Link.Create, ({ body }) => {
    // const data = {
    //   events: body.events.map((e) => ({ id: e })),
    // };
    return pipe(
      ctx.urlMetadata.fetchMetadata(body.url, {}, (e) => ServerError()),
      TE.chain((m) =>
        ctx.db.save(LinkEntity, [
          {
            ...m,
            events: [],
            title: m.title,
            image: m.image
              ? {
                  description: m.description,
                  thumbnail: m.image,
                  location: m.image,
                  type: "image/jpeg" as const,
                }
              : null,
            url: sanitizeURL(m.url as any),
            publishDate: m.date ? parseISO(m.date) : undefined,
            keywords: [],
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
