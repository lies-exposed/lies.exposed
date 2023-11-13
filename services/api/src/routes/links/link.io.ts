import * as io from "@liexp/shared/lib/io";
import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/function";
import { UUID } from "io-ts-types/lib/UUID";
import { type LinkEntity } from "@entities/Link.entity";
import { type ControllerError, DecodeError } from "@io/ControllerError";

export const toLinkIO = (
  link: LinkEntity,
): E.Either<ControllerError, io.http.Link.Link> => {
  return pipe(
    io.http.Link.Link.decode({
      ...link,
      title: link.title ?? undefined,
      description: link.description ?? undefined,
      image: link.image
        ? {
            ...link.image,
            label: link.image.label ?? undefined,
            description: link.image.description ?? undefined,
            extra: link.image.extra ?? undefined,
            thumbnail: link.image.thumbnail ?? undefined,
            links: link.image.links ?? [],
            events: link.image.events ?? [],
            keywords: link.image.keywords ?? [],
            areas: link.image.areas ?? [],
          }
        : undefined,
      keywords: link.keywords ?? [],
      provider: UUID.is(link.provider) ? link.provider : undefined,
      creator: UUID.is(link.creator) ? link.creator : undefined,
      publishDate: link.publishDate?.toISOString() ?? undefined,
      events: link.events ?? [],
      socialPosts: link.socialPosts ?? [],
      createdAt: link.createdAt.toISOString(),
      updatedAt: link.updatedAt.toISOString(),
      deletedAt: link.deletedAt?.toISOString(),
    }),
    E.mapLeft((e) => DecodeError(`Failed to decode link (${link.id})`, e)),
  );
};
