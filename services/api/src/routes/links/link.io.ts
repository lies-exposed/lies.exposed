import * as io from "@liexp/shared/io";
import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
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
      image: link.image ?? undefined,
      keywords: link.keywords,
      provider: link.provider ?? undefined,
      publishDate: link.publishDate?.toISOString() ?? undefined,
      createdAt: link.createdAt.toISOString(),
      updatedAt: link.updatedAt.toISOString(),
      events: link.events ?? [],
    }),
    E.mapLeft((e) => DecodeError(`Failed to decode link (${link.id})`, e))
  );
};
