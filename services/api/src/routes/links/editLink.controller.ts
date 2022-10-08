import { AddEndpoint, Endpoints } from "@liexp/shared/endpoints";
import { sanitizeURL } from "@liexp/shared/utils/url.utils";
import { Router } from "express";
import * as O from "fp-ts/lib/Option";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/function";
import { Equal, In } from "typeorm";
import { RouteContext } from "../route.types";
import { toLinkIO } from "./link.io";
import { EventV2Entity } from "@entities/Event.v2.entity";
import { LinkEntity } from "@entities/Link.entity";
import { fetchAsLink } from "@flows/link.flow";
import { authenticationHandler } from '@utils/authenticationHandler';

export const MakeEditLinkRoute = (r: Router, ctx: RouteContext): void => {
  AddEndpoint(r, authenticationHandler(ctx, ['admin:edit']))(
    Endpoints.Link.Edit,
    ({ params: { id }, body: { events, url, overrideThumbnail, ...body } }) => {
      ctx.logger.debug.log("Update link with dat %O", { events, url, ...body });
      const linkUpdate = {
        ...body,
        url: sanitizeURL(url),
        // events: events.map((e) => ({ id: e })),
        keywords: body.keywords.map((k) => ({ id: k })),
        id,
      };
      ctx.logger.debug.log("Update link data %O", linkUpdate);

      return pipe(
        ctx.db.findOneOrFail(LinkEntity, {
          where: { id: Equal(id) },
          relations: ["image"],
        }),
        TE.chain((l) => {
          return pipe(
            overrideThumbnail,
            O.map((t) => {
              if (t) {
                return pipe(
                  fetchAsLink(ctx)(l.url as any),
                  TE.map((ll) => ({
                    ...ll,
                    ...l,
                    ...linkUpdate,
                    image: ll.image,
                  }))
                );
              }

              return TE.right({
                ...l,
                ...linkUpdate,
              });
            }),
            O.getOrElse(() => TE.right({ ...l, ...linkUpdate }))
          );
        }),
        TE.chain((l) => ctx.db.save(LinkEntity, [l])),
        TE.chain(([link]) =>
          pipe(
            ctx.db.find(EventV2Entity, {
              where: { id: In(events) },
              loadRelationIds: { relations: ["links"] },
            }),
            TE.chain((events) =>
              ctx.db.save(
                EventV2Entity,
                events.map((e) => {
                  return {
                    ...e,
                    links: (e.links as any[] as string[])
                      .filter((l) => l !== link.id)
                      .map((l) => ({ id: l }))
                      .concat({ id: link.id } as any),
                  };
                })
              )
            )
          )
        ),
        TE.chain(() =>
          ctx.db.findOneOrFail(LinkEntity, {
            where: { id: Equal(id) },
            relations: ['image'],
            loadRelationIds: { relations: ["events", "keywords"] },
          })
        ),
        TE.chainEitherK(toLinkIO),
        TE.map((data) => ({
          body: { data },
          statusCode: 200,
        }))
      );
    }
  );
};
