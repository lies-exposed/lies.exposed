import { pipe } from "@liexp/core/lib/fp/index.js";
import { UUID } from "@liexp/shared/lib/io/http/Common/UUID.js";
import {
  type _DecodeError,
  DecodeError,
} from "@liexp/shared/lib/io/http/Error/DecodeError.js";
import { Media } from "@liexp/shared/lib/io/http/Media/Media.js";
import * as io from "@liexp/shared/lib/io/index.js";
import { toInitialValue } from "@liexp/shared/lib/providers/blocknote/utils.js";
import { toColor } from "@liexp/shared/lib/utils/colors.js";
import * as E from "fp-ts/lib/Either.js";
import { type ActorEntity } from "../entities/Actor.entity.js";
import { IOCodec } from "./DomainCodec.js";
import { MediaIO } from "./media.io.js";

const toActorIO = (
  { old_avatar, ...a }: ActorEntity,
  spaceEndpoint: string,
): E.Either<_DecodeError, io.http.Actor.Actor> => {
  return pipe(
    E.Do,
    E.bind(
      "avatar",
      (): E.Either<_DecodeError, UUID | Media | undefined> =>
        a.avatar
          ? UUID.is(a.avatar)
            ? E.right(a.avatar)
            : pipe(
                MediaIO.decodeSingle(a.avatar, spaceEndpoint),
                E.map((media) => Media.encode(media) as any as Media),
              )
          : // : E.right({
            //     ...a.avatar,
            //     createdAt: a.avatar.createdAt.toISOString(),
            //     updatedAt: a.avatar.updatedAt.toISOString(),
            //     extra: a.avatar.extra ?? undefined,
            //     description: a.avatar.description ?? undefined,
            //     creator: undefined,
            //     events: a.avatar.events ?? [],
            //     links: a.avatar.links ?? [],
            //     keywords: a.avatar.keywords ?? [],
            //     areas: a.avatar.areas ?? [],
            //     featuredInAreas: a.avatar.featuredInAreas ?? [],
            //     featuredInStories: a.avatar.featuredInStories ?? [],
            //     socialPosts: a.avatar.socialPosts ?? [],
            //     deletedAt: a.avatar.deletedAt ?? undefined,
            //   })
            E.right(undefined),
    ),
    E.chain(({ avatar }) => {
      return pipe(
        io.http.Actor.Actor.decode({
          ...a,
          color: toColor(a.color),
          avatar,
          excerpt: toInitialValue(a.excerpt) ?? null,
          body: toInitialValue(a.body) ?? null,
          memberIn: a.memberIn ? a.memberIn : [],
          createdAt: a.createdAt.toISOString(),
          updatedAt: a.updatedAt.toISOString(),
          bornOn: a.bornOn ?? undefined,
          diedOn: a.diedOn ?? undefined,
        }),
        E.mapLeft((e) => DecodeError.of(`Failed to decode actor (${a.id})`, e)),
      );
    }),
  );
};

export const ActorIO = IOCodec(toActorIO, "actor");
