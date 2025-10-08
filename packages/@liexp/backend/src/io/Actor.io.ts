import { pipe } from "@liexp/core/lib/fp/index.js";
import { UUID } from "@liexp/shared/lib/io/http/Common/UUID.js";
import {
  type _DecodeError,
  DecodeError,
} from "@liexp/shared/lib/io/http/Error/DecodeError.js";
import * as io from "@liexp/shared/lib/io/index.js";
import { isValidValue } from "@liexp/shared/lib/providers/blocknote/isValidValue.js";
import { toInitialValue } from "@liexp/shared/lib/providers/blocknote/utils.js";
import { toColor } from "@liexp/shared/lib/utils/colors.js";
import { Schema } from "effect";
import * as E from "fp-ts/lib/Either.js";
import { type ActorEntity } from "../entities/Actor.entity.js";
import { IOCodec } from "./DomainCodec.js";
import { MediaIO } from "./media.io.js";

export const encodeActor = ({
  old_avatar: _old_avatar,
  ...a
}: ActorEntity): E.Either<
  _DecodeError,
  Schema.Schema.Encoded<typeof io.http.Actor.Actor>
> => {
  return pipe(
    E.Do,
    E.bind(
      "avatar",
      (): E.Either<_DecodeError, UUID | io.http.Media.Media | undefined> =>
        a.avatar
          ? Schema.is(UUID)(a.avatar)
            ? E.right(a.avatar)
            : pipe(
                MediaIO.decodeSingle(a.avatar),
                // E.map((m) => ({
                //   ...m,
                //   createdAt: m.createdAt.toISOString(),
                // })),
              )
          : E.right(undefined),
    ),
    E.chain(({ avatar }) => {
      return pipe(
        {
          ...a,
          color: toColor(a.color),
          avatar,
          excerpt:
            a.excerpt && isValidValue(a.excerpt)
              ? toInitialValue(a.excerpt)
              : null,
          body: a.body && isValidValue(a.body) ? toInitialValue(a.body) : null,
          memberIn: a.memberIn ?? [],
          nationalities: a.nationalities ?? [],
          bornOn: a.bornOn ?? undefined,
          diedOn: a.diedOn ?? undefined,
        },
        Schema.encodeUnknownEither(io.http.Actor.Actor),
        E.mapLeft((e) => DecodeError.of(`Failed to encode actor (${a.id})`, e)),
      );
    }),
  );
};

const decodeActor = ({
  old_avatar: _old_avatar,
  ...a
}: ActorEntity): E.Either<_DecodeError, io.http.Actor.Actor> => {
  return pipe(
    E.Do,
    E.bind(
      "avatar",
      (): E.Either<
        _DecodeError,
        UUID | Schema.Schema.Encoded<typeof io.http.Media.Media> | undefined
      > =>
        a.avatar
          ? Schema.is(UUID)(a.avatar)
            ? E.right(a.avatar)
            : pipe(MediaIO.encodeSingle(a.avatar))
          : E.right(undefined),
    ),
    E.chain(({ avatar }) => {
      return pipe(
        {
          ...a,
          color: toColor(a.color),
          avatar,
          excerpt: toInitialValue(a.excerpt) ?? null,
          body: toInitialValue(a.body) ?? null,
          memberIn: a.memberIn ? a.memberIn : [],
          nationalities: a.nationalities ?? [],
          createdAt: a.createdAt.toISOString(),
          updatedAt: a.updatedAt.toISOString(),
          bornOn: a.bornOn ?? undefined,
          diedOn: a.diedOn ?? undefined,
        },
        Schema.decodeUnknownEither(io.http.Actor.Actor),
        E.mapLeft((e) => DecodeError.of(`Failed to decode actor (${a.id})`, e)),
      );
    }),
  );
};

export const ActorIO = IOCodec(
  io.http.Actor.Actor,
  {
    decode: decodeActor,
    encode: encodeActor,
  },
  "actor",
);
