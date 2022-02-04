import { AddEndpoint, Endpoints } from "@econnessione/shared/endpoints";
import { sanitizeURL } from "@econnessione/shared/utils/url.utils";
import { Router } from "express";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/function";
import { In } from "typeorm";
import { RouteContext } from "../route.types";
import { toLinkIO } from "./link.io";
import { EventV2Entity } from "@entities/Event.v2.entity";
import { LinkEntity } from "@entities/Link.entity";

export const MakeEditLinkRoute = (r: Router, ctx: RouteContext): void => {
  AddEndpoint(r)(
    Endpoints.Link.Edit,
    ({ params: { id }, body: { events, url, ...body } }) => {
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
        ctx.db.save(LinkEntity, [{ ...linkUpdate }]),
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
                    links: e.links.concat({ id: link.id } as any),
                  };
                })
              )
            )
          )
        ),
        TE.chain(() =>
          ctx.db.findOneOrFail(LinkEntity, {
            where: { id },
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
