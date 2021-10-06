import { AddEndpoint, Endpoints } from "@econnessione/shared/endpoints";
import { sanitizeURL } from "@econnessione/shared/utils/url.utils";
import { Router } from "express";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/pipeable";
import { toLinkIO } from "./link.io";
import { LinkEntity } from "@entities/Link.entity";
import { RouteContext } from "routes/route.types";

export const MakeEditLinkRoute = (r: Router, ctx: RouteContext): void => {
  AddEndpoint(r)(
    Endpoints.Link.Edit,
    ({ params: { id }, body: { events, url, ...body } }) => {
      ctx.logger.debug.log("Update link with dat %O", { events, url, ...body });
      const linkUpdate = {
        ...body,
        url: sanitizeURL(url),
        events: events.map((e) => ({ id: e })),
        id,
      };
      ctx.logger.debug.log("Update link data %O", linkUpdate);
      return pipe(
        ctx.db.save(LinkEntity, [linkUpdate]),
        TE.chain(() =>
          ctx.db.findOneOrFail(LinkEntity, {
            where: { id },
            loadRelationIds: { relations: ["events"] },
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
