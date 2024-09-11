import { pipe } from "@liexp/core/lib/fp/index.js";
import * as io from "@liexp/shared/lib/io/index.js";
import { toColor } from "@liexp/shared/lib/utils/colors.js";
import { toInitialValue } from "@liexp/ui/lib/components/Common/BlockNote/utils/utils.js";
import * as E from "fp-ts/lib/Either.js";
import { type ActorEntity } from "../../entities/Actor.entity.js";
import { type ControllerError, DecodeError } from "#io/ControllerError.js";
import { IOCodec } from "#io/DomainCodec.js";
import { MediaIO } from "#routes/media/media.io.js";

const toActorIO = (
  { old_avatar, ...a }: ActorEntity,
  spaceEndpoint: string,
): E.Either<ControllerError, io.http.Actor.Actor> => {
  return pipe(
    E.Do,
    E.bind("avatar", () =>
      a.avatar
        ? MediaIO.decodeSingle(a.avatar, spaceEndpoint)
        : E.right(undefined),
    ),
    E.chain(({ avatar }) =>
      pipe(
        io.http.Actor.Actor.decode({
          ...a,
          color: toColor(a.color),
          avatar: avatar
            ? {
                ...avatar,
                createdAt: avatar.createdAt.toISOString(),
                updatedAt: avatar.updatedAt.toISOString(),
              }
            : undefined,
          excerpt: toInitialValue(a.excerpt) ?? null,
          body: toInitialValue(a.body) ?? null,
          memberIn: a.memberIn ? a.memberIn : [],
          createdAt: a.createdAt.toISOString(),
          updatedAt: a.updatedAt.toISOString(),
          bornOn: a.bornOn ?? undefined,
          diedOn: a.diedOn ?? undefined,
        }),
        E.mapLeft((e) => DecodeError(`Failed to decode actor (${a.id})`, e)),
      ),
    ),
  );
};

export const ActorIO = IOCodec(toActorIO, "actor");
