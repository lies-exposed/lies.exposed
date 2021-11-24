import { AddEndpoint, Endpoints } from "@econnessione/shared/endpoints";
import { sanitizeURL } from "@econnessione/shared/utils/url.utils";
import { Router } from "express";
import * as A from "fp-ts/lib/Array";
import * as E from "fp-ts/lib/Either";
import * as O from "fp-ts/lib/Option";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/function";
import { DeepPartial } from "typeorm";
import { toLinkIO } from "./link.io";
import { EventEntity } from "@entities/Event.entity";
import { LinkEntity } from "@entities/Link.entity";
import { ServerError } from "@io/ControllerError";
import { RouteContext } from "@routes/route.types";

export const MakeCreateLinkRoute = (r: Router, ctx: RouteContext): void => {
  AddEndpoint(r)(Endpoints.Link.Create, ({ body }) => {
    const data = {
      events: pipe(
        body.events,
        O.map((events) => events.map((e) => ({ id: e }))),
        O.getOrElse((): Array<DeepPartial<EventEntity>> => [])
      ),
    };
    return pipe(
      ctx.urlMetadata.fetchMetadata(body.url, (e) => ServerError()),
      TE.chain((meta) =>
        ctx.db.save(LinkEntity, [
          {
            ...meta,
            ...data,
            title: meta.title,
            description: meta.description,
            keywords: [],
            provider: meta.provider,
            url: sanitizeURL(body.url),
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
