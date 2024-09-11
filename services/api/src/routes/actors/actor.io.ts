import { pipe } from "@liexp/core/lib/fp/index.js";
import * as io from "@liexp/shared/lib/io/index.js";
import { toColor } from "@liexp/shared/lib/utils/colors.js";
import * as E from "fp-ts/lib/Either.js";
import { type ActorEntity } from "../../entities/Actor.entity.js";
import { type ControllerError, DecodeError } from "#io/ControllerError.js";
import { IOCodec } from "#io/DomainCodec.js";

const toActorIO = (
  a: ActorEntity,
): E.Either<ControllerError, io.http.Actor.Actor> => {
  return pipe(
    E.Do,
    E.bind("avatar", () =>
      a.avatar
        ? // ? MediaIO.decodeSingle(a.avatar, spaceEndpoint)
          E.right(a.avatar)
        : E.right(undefined),
    ),
    E.chain(({ avatar }) =>
      pipe(
        io.http.Actor.Actor.decode({
          ...a,
          color: toColor(a.color),
          avatar: avatar,
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
