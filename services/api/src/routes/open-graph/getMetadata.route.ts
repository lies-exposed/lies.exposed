import { AddEndpoint, Endpoints } from "@liexp/shared/endpoints";
import { type Link } from "@liexp/shared/io/http";
import { type Router } from "express";
import { sequenceS } from "fp-ts/Apply";
import * as O from "fp-ts/Option";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { type Metadata } from "page-metadata-parser";
import { Equal } from "typeorm";
import { LinkEntity } from "@entities/Link.entity";
import { extractRelationsFromURL } from "@flows/events/extractFromURL.flow";
import {
  type ControllerError,
  ServerError,
  toControllerError,
} from "@io/ControllerError";
import { toLinkIO } from "@routes/links/link.io";
import { type RouteContext } from "@routes/route.types";

export const MakeGetMetadataRoute = (r: Router, ctx: RouteContext): void => {
  AddEndpoint(r)(
    Endpoints.OpenGraph.Custom.GetMetadata,
    ({ query: { url } }) => {
      return pipe(
        ctx.db.findOne(LinkEntity, {
          where: {
            url: Equal(url),
          },
        }),
        TE.chain((link) => {
          const linkAndMetadata = sequenceS(TE.ApplicativePar)({
            metadata: O.isSome(link)
              ? TE.right<ControllerError, Metadata>({
                  date: link.value.publishDate?.toISOString() ?? undefined,
                  title: undefined as any,
                  description: link.value.description,
                  keywords: [],
                  icon: "",
                  image: link.value.image?.location ?? null,
                  provider: link.value.provider,
                  type: "article",
                  url: link.value.url,
                })
              : ctx.urlMetadata.fetchMetadata(url, {}, (e) => ServerError()),
            link: pipe(
              link,
              O.map(toLinkIO),
              O.map(TE.fromEither),
              O.getOrElse(() =>
                TE.right<ControllerError, Link.Link | undefined>(undefined)
              )
            ),
            relations: pipe(
              link,
              O.map((l) => l.url),
              O.getOrElse(() => url),
              (url) => ctx.puppeteer.getBrowserFirstPage(url, {}),
              TE.mapLeft(toControllerError),
              TE.chain((p) => extractRelationsFromURL(ctx)(p, url))
            ),
          });

          return linkAndMetadata;
        }),
        TE.map((data) => ({
          body: {
            data,
          },
          statusCode: 200,
        }))
      );
    }
  );
};
