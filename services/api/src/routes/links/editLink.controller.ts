import { EventV2Entity } from "@liexp/backend/lib/entities/Event.v2.entity.js";
import { type KeywordEntity } from "@liexp/backend/lib/entities/Keyword.entity.js";
import { LinkEntity } from "@liexp/backend/lib/entities/Link.entity.js";
import { type MediaEntity } from "@liexp/backend/lib/entities/Media.entity.js";
import { UserEntity } from "@liexp/backend/lib/entities/User.entity.js";
import { authenticationHandler } from "@liexp/backend/lib/express/middleware/auth.middleware.js";
import { fromURL } from "@liexp/backend/lib/flows/links/link.flow.js";
import { LinkIO } from "@liexp/backend/lib/io/link.io.js";
import { GetQueueProvider } from "@liexp/backend/lib/providers/queue.provider.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { uuid } from "@liexp/io/lib/http/Common/UUID.js";
import { UUID } from "@liexp/io/lib/http/Common/index.js";
import { APPROVED, LINKS, type LinkMedia } from "@liexp/io/lib/http/Link.js";
import {
  OpenAIUpdateEntitiesFromURLType,
  PendingStatus,
  type Queue,
} from "@liexp/io/lib/http/Queue/index.js";
import { Endpoints } from "@liexp/shared/lib/endpoints/api/index.js";
import { sanitizeURL } from "@liexp/shared/lib/utils/url.utils.js";
import { Schema } from "effect";
import * as O from "fp-ts/lib/Option.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { Equal, In } from "typeorm";
import { type TEControllerError } from "../../types/TEControllerError.js";
import { type Route } from "../route.types.js";
import { toControllerError } from "#io/ControllerError.js";
import { AddEndpoint } from "#routes/endpoint.subscriber.js";
import { ensureUserExists } from "#utils/user.utils.js";

const updateLinkMedia = (
  link: LinkEntity,
  image: UUID | LinkMedia | null,
): MediaEntity | UUID | null => {
  if (image === null) {
    return null;
  }

  if (Schema.is(UUID)(image)) {
    return image;
  }

  const oldMedia: Partial<MediaEntity> =
    Schema.is(UUID)(link.image) || link.image === null ? {} : link.image;

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
    thumbnail: image.thumbnail ?? image.location,
    location: image.location,
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
            image: Schema.is(UUID)(image) ? image : (image ?? null),
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
        TE.chain(({ linkUpdate, user }) => {
          let previousStatus: string | undefined;
          return pipe(
            ctx.db.findOneOrFail(LinkEntity, {
              where: { id: Equal(id) },
              relations: ["image"],
            }),
            TE.chain((l): TEControllerError<LinkEntity> => {
              previousStatus = l.status;
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
            TE.chain((finalLink) => {
              const newStatus = (linkUpdate as any).status;
              if (
                previousStatus !== APPROVED.literals[0] &&
                newStatus === APPROVED.literals[0]
              ) {
                const job: Queue = {
                  id: uuid(),
                  resource: LINKS.literals[0],
                  type: OpenAIUpdateEntitiesFromURLType.literals[0],
                  prompt: null,
                  data: { linkId: id },
                  error: null,
                  status: PendingStatus.literals[0],
                  result: null,
                } as Queue;
                return pipe(
                  GetQueueProvider.queue<Queue, typeof ctx>(
                    OpenAIUpdateEntitiesFromURLType.literals[0],
                  ).addJob(job)(ctx),
                  TE.mapLeft(toControllerError),
                  TE.map(() => finalLink),
                );
              }
              return TE.right(finalLink);
            }),
          );
        }),
        TE.chainEitherK((l) => LinkIO.decodeSingle(l)),
        TE.map((data) => ({
          body: { data },
          statusCode: 200,
        })),
      );
    },
  );
};
