import { pipe } from "@liexp/core/lib/fp/index.js";
import { UUID } from "@liexp/shared/lib/io/http/Common/index.js";
import {
  type _DecodeError,
  DecodeError,
} from "@liexp/shared/lib/io/http/Error/DecodeError.js";
import { ImageMediaExtraMonoid } from "@liexp/shared/lib/io/http/Media/MediaExtra.js";
import { MediaExtraMonoid } from "@liexp/shared/lib/io/http/Media/MediaExtra.js";
import * as io from "@liexp/shared/lib/io/index.js";
import * as E from "fp-ts/lib/Either.js";
import { type LinkEntity } from "../entities/Link.entity.js";
import { IOCodec } from "./DomainCodec.js";

const toLinkIO = (
  link: LinkEntity,
): E.Either<_DecodeError, io.http.Link.Link> => {
  return pipe(
    io.http.Link.Link.decode({
      ...link,
      title: link.title ?? undefined,
      description: link.description ?? undefined,
      image: link.image
        ? UUID.is(link.image)
          ? link.image
          : {
              ...link.image,
              label: link.image.label ?? undefined,
              description: link.image.description ?? undefined,
              extra: link.image.extra
                ? MediaExtraMonoid.concat(
                    ImageMediaExtraMonoid.empty,
                    link.image.extra,
                  )
                : undefined,
              thumbnail: link.image.thumbnail ?? undefined,
              links: link.image.links ?? [],
              events: (link.image.events ?? []).map((e) =>
                UUID.is(e) ? e : e.id,
              ),
              keywords: link.image.keywords ?? [],
              areas: link.image.areas ?? [],
            }
        : undefined,

      provider: UUID.is(link.provider) ? link.provider : undefined,
      creator: UUID.is(link.creator) ? link.creator : undefined,
      publishDate: link.publishDate?.toISOString() ?? undefined,
      events: (link.events ?? []).map((e) => (UUID.is(e) ? e : e.id)),
      keywords: (link.keywords ?? []).map((k) => (UUID.is(k) ? k : k.id)),
      socialPosts: link.socialPosts ?? [],
      createdAt: link.createdAt.toISOString(),
      updatedAt: link.updatedAt.toISOString(),
      deletedAt: link.deletedAt?.toISOString(),
    }),
    E.mapLeft((e) => DecodeError.of(`Failed to decode link (${link.id})`, e)),
  );
};

export const LinkIO = IOCodec(toLinkIO, "link");
