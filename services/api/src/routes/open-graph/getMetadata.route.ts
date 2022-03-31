import { AddEndpoint, Endpoints } from "@liexp/shared/endpoints";
import { Link } from '@liexp/shared/io/http';
import { Router } from "express";
import { sequenceS } from 'fp-ts/lib/Apply';
import * as O from 'fp-ts/lib/Option';
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/function";
import { Metadata } from 'page-metadata-parser';
import { LinkEntity } from '@entities/Link.entity';
import { ControllerError, ServerError } from "@io/ControllerError";
import { toLinkIO } from '@routes/links/link.io';
import { RouteContext } from "@routes/route.types";

export const MakeGetMetadataRoute = (r: Router, ctx: RouteContext): void => {
  AddEndpoint(r)(
    Endpoints.OpenGraph.Custom.GetMetadata,
    ({ query: { url } }) => {
      return pipe(
        ctx.db.findOne(LinkEntity, {
          where: {
            url,
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
                  image: link.value.image ?? "",
                  provider: link.value.provider,
                  type: "article",
                  url: link.value.url,
                })
              : ctx.urlMetadata.fetchMetadata(url, {}, (e) => ServerError()),
            link: pipe(
              link,
              O.map(toLinkIO),
              O.map(TE.fromEither),
              O.getOrElse(() => TE.right<ControllerError, Link.Link | undefined>(undefined))
            ),
          })

          return linkAndMetadata
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
