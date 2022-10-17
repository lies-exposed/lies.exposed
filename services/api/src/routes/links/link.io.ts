import * as io from "@liexp/shared/io";
import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/function";
import { UUID } from "io-ts-types/lib/UUID";
import { LinkEntity } from "@entities/Link.entity";
import { ControllerError, DecodeError } from "@io/ControllerError";

export const toLinkIO = (
  link: LinkEntity
): E.Either<ControllerError, io.http.Link.Link> => {
  return pipe(
    io.http.Link.Link.decode({
      ...link,
      title: link.title ?? undefined,
      description: link.description ?? undefined,
      image: link.image
        ? {
            ...link.image,
            thumbnail: link.image.thumbnail ?? undefined,
          }
        : undefined,
      keywords: link.keywords ?? [],
      provider: UUID.is(link.provider) ? link.provider : undefined,
      publishDate: link.publishDate?.toISOString() ?? undefined,
      createdAt: link.createdAt.toISOString(),
      updatedAt: link.updatedAt.toISOString(),
      events: link.events ?? [],
    }),
    E.mapLeft((e) => DecodeError(`Failed to decode link (${link.id})`, e))
  );
};
