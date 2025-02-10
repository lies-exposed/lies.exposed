import { EventV2Entity } from "@liexp/backend/lib/entities/Event.v2.entity.js";
import { type KeywordEntity } from "@liexp/backend/lib/entities/Keyword.entity.js";
import { LinkEntity } from "@liexp/backend/lib/entities/Link.entity.js";
import { type MediaEntity } from "@liexp/backend/lib/entities/Media.entity.js";
import { UserEntity } from "@liexp/backend/lib/entities/User.entity.js";
import { fromURL } from "@liexp/backend/lib/flows/links/link.flow.js";
import { LinkIO } from "@liexp/backend/lib/io/link.io.js";
import { pipe } from "@liexp/core/lib/fp/index.js";
import { Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import { UUID, type URL } from "@liexp/shared/lib/io/http/Common/index.js";
import { type LinkMedia } from "@liexp/shared/lib/io/http/Link.js";
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

const updateLinkMedia = (
  link: LinkEntity,
  image: UUID | LinkMedia | null,
): MediaEntity | UUID | null => {
  if (image === null) {
    return null;
  }

  if (UUID.is(image)) {
    return image;
  }

  const oldMedia: Partial<MediaEntity> =
    UUID.is(link.image) || link.image === null ? {} : link.image;

  return {
    ...oldMedia,
    ...image,
    events: [],
    keywords: [],
    areas: [],
    links: [],
    stories: [],
    featuredInAreas: [],
    featuredInStories: [],
    socialPosts: [],
    label: image.label ?? oldMedia?.label ?? null,
    thumbnail: (image.thumbnail ?? image.location) as URL,
    location: image.location as URL,
    description: image.description ?? oldMedia?.description ?? null,
    extra: image.extra ?? null,
    deletedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    creator: oldMedia.creator ?? null,
  };
};

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
            image: UUID.is(image) ? image : (image ?? null),
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
                        image: updateLinkMedia(ll, linkUpdate.image),
                      })),
                    );
                  }

                  return TE.right({
                    ...l,
                    ...linkUpdate,
                    publishDate: linkUpdate.publishDate ?? null,
                    provider: linkUpdate.provider ?? l.provider ?? null,
                    image: updateLinkMedia(l, linkUpdate.image),
                  });
                }),
                O.getOrElse(() =>
                  TE.right({
                    ...l,
                    ...linkUpdate,
                    publishDate: linkUpdate.publishDate ?? null,
                    provider: linkUpdate.provider ?? l.provider ?? null,
                    image: (linkUpdate.image ?? l.image) as
                      | MediaEntity
                      | UUID
                      | null,
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
