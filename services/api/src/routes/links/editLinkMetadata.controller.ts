import { pipe } from "@liexp/core/lib/fp/index.js";
import { AddEndpoint } from "@liexp/shared/lib/endpoints/index.js";
import { UpdateMetadata } from "@liexp/shared/lib/endpoints/link.endpoints.js";
import { uuid } from "@liexp/shared/lib/utils/uuid.js";
import { type Router } from "express";
import { sequenceS } from "fp-ts/Apply";
import * as TE from "fp-ts/TaskEither";
import { Equal } from "typeorm";
import { toLinkIO } from "./link.io.js";
import { LinkEntity } from "#entities/Link.entity.js";
import { ServerError } from "#io/ControllerError.js";
import { type RouteContext } from "#routes/route.types.js";
import { authenticationHandler } from "#utils/authenticationHandler.js";

export const MakeEditLinkMetadataRoute = (
  r: Router,
  ctx: RouteContext,
): void => {
  AddEndpoint(r, authenticationHandler(ctx, ["admin:edit"]))(
    UpdateMetadata,
    ({ params: { id } }) => {
      return pipe(
        ctx.db.findOneOrFail(LinkEntity, { where: { id: Equal(id) } }),
        TE.chain((link) =>
          sequenceS(TE.ApplicativePar)({
            link: TE.right(link),
            meta: ctx.urlMetadata.fetchMetadata(link.url, {}, (e) => {
              ctx.logger.error.log("Error fetching data %O", e);
              return ServerError();
            }),
          }),
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
          ]),
        ),
        TE.chain(() =>
          ctx.db.findOneOrFail(LinkEntity, {
            where: { id: Equal(id) },
            loadRelationIds: { relations: ["events"] },
          }),
        ),
        TE.chainEitherK(toLinkIO),
        TE.map((data) => ({
          body: { data },
          statusCode: 200,
        })),
      );
    },
  );
};
