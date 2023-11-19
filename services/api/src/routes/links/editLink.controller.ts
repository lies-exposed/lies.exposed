import { AddEndpoint, Endpoints } from "@liexp/shared/lib/endpoints";
import { sanitizeURL } from "@liexp/shared/lib/utils/url.utils";
import { type Router } from "express";
import * as O from "fp-ts/Option";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { UUID } from "io-ts-types/lib/UUID";
import { Equal, In } from "typeorm";
import { type RouteContext } from "../route.types";
import { toLinkIO } from "./link.io";
import { EventV2Entity } from "@entities/Event.v2.entity";
import { type KeywordEntity } from "@entities/Keyword.entity";
import { LinkEntity } from "@entities/Link.entity";
import { type MediaEntity } from "@entities/Media.entity";
import { UserEntity } from "@entities/User.entity";
import { fetchAsLink } from "@flows/links/link.flow";
import { type ControllerError } from "@io/ControllerError";
import { authenticationHandler } from "@utils/authenticationHandler";
import { ensureUserExists } from "@utils/user.utils";

export const MakeEditLinkRoute = (r: Router, ctx: RouteContext): void => {
  AddEndpoint(r, authenticationHandler(ctx, ["admin:edit"]))(
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
            image: UUID.is(image) ? { id: image } : image ?? null,
            // events: events.map((e) => ({ id: e })),
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
                      fetchAsLink(ctx)(user, l.url, undefined),
                      TE.map((ll) => ({
                        ...ll,
                        ...l,
                        ...linkUpdate,
                        provider: linkUpdate.provider ?? l.provider ?? null,
                        publishDate: linkUpdate.publishDate ?? null,
                        image: ll.image
                          ? ({
                              ...ll.image,
                              events: [],
                              keywords: [],
                              areas: [],
                              links: [],
                              stories: [],
                              label: ll.image.label ?? null,
                              description: ll.image.description ?? null,
                              thumbnail: ll.image.thumbnail ?? null,
                            } as any)
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
                      ? ({
                          ...l.image,
                          events: [],
                          keywords: [],
                          areas: [],
                          links: [],
                          stories: [],
                          label: l.image.label ?? null,
                          description: l.image.description ?? null,
                          thumbnail: l.image.thumbnail ?? null,
                        } as any)
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
        TE.chainEitherK(toLinkIO),
        TE.map((data) => ({
          body: { data },
          statusCode: 200,
        })),
      );
    },
  );
};
