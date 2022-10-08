import { AddEndpoint } from "@liexp/shared/endpoints";
import { UpdateMetadata } from "@liexp/shared/endpoints/link.endpoints";
import { uuid } from "@liexp/shared/utils/uuid";
import { Router } from "express";
import { sequenceS } from "fp-ts/lib/Apply";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/function";
import { Equal } from "typeorm";
import { toLinkIO } from "./link.io";
import { LinkEntity } from "@entities/Link.entity";
import { ServerError } from "@io/ControllerError";
import { RouteContext } from "@routes/route.types";
import { authenticationHandler } from '@utils/authenticationHandler';

export const MakeEditLinkMetadataRoute = (
  r: Router,
  ctx: RouteContext
): void => {
  AddEndpoint(r, authenticationHandler(ctx, ['admin:edit']))(UpdateMetadata, ({ params: { id } }) => {
    return pipe(
      ctx.db.findOneOrFail(LinkEntity, { where: { id: Equal(id) } }),
      TE.chain((link) =>
        sequenceS(TE.ApplicativePar)({
          link: TE.right(link),
          meta: ctx.urlMetadata.fetchMetadata(link.url, {}, (e) => {
            ctx.logger.error.log("Error fetching data %O", e);
            return ServerError();
          }),
        })
      ),
      TE.chain(({ link, meta }) =>
        ctx.db.save(LinkEntity, [
          {
            ...link,
            title: meta.title,
            description: meta.description,
            image: meta.image
              ? {
                  id: uuid(),
                  location: meta.image,
                  publishDate: meta.date ?? new Date(),
                }
              : null,
          },
        ])
      ),
      TE.chain(() =>
        ctx.db.findOneOrFail(LinkEntity, {
          where: { id: Equal(id) },
          loadRelationIds: { relations: ["events"] },
        })
      ),
      TE.chainEitherK(toLinkIO),
      TE.map((data) => ({
        body: { data },
        statusCode: 200,
      }))
    );
  });
};
