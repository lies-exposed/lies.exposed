import { EventV2Entity } from "@liexp/backend/lib/entities/Event.v2.entity.js";
import { type KeywordEntity } from "@liexp/backend/lib/entities/Keyword.entity.js";
import { LinkEntity } from "@liexp/backend/lib/entities/Link.entity.js";
import { type MediaEntity } from "@liexp/backend/lib/entities/Media.entity.js";
import { UserEntity } from "@liexp/backend/lib/entities/User.entity.js";
import { fromURL } from "@liexp/backend/lib/flows/links/link.flow.js";
import { LinkIO } from "@liexp/backend/lib/io/link.io.js";
import { pipe } from "@liexp/core/lib/fp/index.js";
import { Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import { UUID } from "@liexp/shared/lib/io/http/Common/index.js";
import { sanitizeURL } from "@liexp/shared/lib/utils/url.utils.js";
import * as O from "fp-ts/lib/Option.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { Equal, In } from "typeorm";
import { type Route } from "../route.types.js";
import {
  toControllerError,
  type ControllerError,
} from "#io/ControllerError.js";
import { AddEndpoint } from "#routes/endpoint.subscriber.js";
import { authenticationHandler } from "#utils/authenticationHandler.js";
import { ensureUserExists } from "#utils/user.utils.js";

export const MakeEditLinkRoute: Route = (r, ctx) => {
  AddEndpoint(r, authenticationHandler(["admin:edit"])(ctx))(
    Endpoints.Link.Edit,
    (
      {
        params: { id },
        body: { events, url, overrideThumbnail, image, creator, ...body },
      },
      req,
    ) => {
      ctx.logger.debug.log("Update link with dat %O", { events, url, ...body });

      return pipe(
        ensureUserExists(req.user),
        TE.fromEither,
        TE.map((u) => {
          const linkUpdate = {
            ...body,
            url: sanitizeURL(url),
            image: UUID.is(image) ? { id: image } : (image ?? null),
            events: events.map((e) => ({ id: e })) as EventV2Entity[],
            keywords: body.keywords.map((k) => ({ id: k })) as KeywordEntity[],
            id,
            creator: pipe(
              creator,
              O.map((id): any => ({ id })),
              O.toNullable,
            ),
          };
          ctx.logger.debug.log("Update link data %O", linkUpdate);
          const user = new UserEntity();
          user.id = u.id;
          return { linkUpdate, user };
        }),
        TE.chain(({ linkUpdate, user }) =>
          pipe(
            ctx.db.findOneOrFail(LinkEntity, {
              where: { id: Equal(id) },
              relations: ["image"],
            }),
            TE.chain((l): TE.TaskEither<ControllerError, LinkEntity> => {
              return pipe(
                overrideThumbnail,
                O.map((t) => {
                  if (t) {
                    return pipe(
                      fromURL(user, l.url, undefined)(ctx),
                      TE.mapLeft(toControllerError),
                      TE.map((ll) => ({
                        ...ll,
                        ...l,
                        ...linkUpdate,
                        provider: linkUpdate.provider ?? l.provider ?? null,
                        publishDate: linkUpdate.publishDate ?? null,
                        image: ll.image
                          ? {
                              ...ll.image,
                              events: [],
                              keywords: [],
                              areas: [],
                              links: [],
                              stories: [],
                              label: ll.image.label ?? null,
                              description: ll.image.description ?? null,
                              thumbnail: ll.image.thumbnail ?? null,
                            }
                          : null,
                      })),
                    );
                  }

                  return TE.right({
                    ...l,
                    ...linkUpdate,
                    publishDate: linkUpdate.publishDate ?? null,
                    provider: linkUpdate.provider ?? l.provider ?? null,
                    image: l.image
                      ? {
                          ...l.image,
                          events: [],
                          keywords: [],
                          areas: [],
                          links: [],
                          stories: [],
                          label: l.image.label ?? null,
                          description: l.image.description ?? null,
                          thumbnail: l.image.thumbnail ?? null,
                        }
                      : null,
                  });
                }),
                O.getOrElse(() =>
                  TE.right({
                    ...l,
                    ...linkUpdate,
                    publishDate: linkUpdate.publishDate ?? null,
                    provider: linkUpdate.provider ?? l.provider ?? null,
                    image: (linkUpdate.image ?? l.image) as MediaEntity | null,
                  }),
                ),
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
                    }),
                  ),
                ),
              ),
            ),
            TE.chain(() =>
              ctx.db.findOneOrFail(LinkEntity, {
                where: { id: Equal(id) },
                relations: ["image"],
                loadRelationIds: { relations: ["events", "keywords"] },
              }),
            ),
          ),
        ),
        TE.chainEitherK(LinkIO.decodeSingle),
        TE.map((data) => ({
          body: { data },
          statusCode: 200,
        })),
      );
    },
  );
};
