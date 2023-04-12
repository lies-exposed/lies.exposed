import { AddEndpoint } from "@liexp/shared/lib/endpoints";
import { UpdateMetadata } from "@liexp/shared/lib/endpoints/link.endpoints";
import { uuid } from "@liexp/shared/lib/utils/uuid";
import { type Router } from "express";
import { sequenceS } from "fp-ts/Apply";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { Equal } from "typeorm";
import { toLinkIO } from "./link.io";
import { LinkEntity } from "@entities/Link.entity";
import { ServerError } from "@io/ControllerError";
import { type RouteContext } from "@routes/route.types";
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
