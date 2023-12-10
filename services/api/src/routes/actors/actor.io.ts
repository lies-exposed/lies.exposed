import { pipe } from "@liexp/core/lib/fp/index.js";
import * as io from "@liexp/shared/lib/io/index.js";
import { toColor } from "@liexp/shared/lib/utils/colors.js";
import { ensureHTTPS } from "@liexp/shared/lib/utils/media.utils.js";
import * as E from "fp-ts/lib/Either.js";
import { type ActorEntity } from "../../entities/Actor.entity.js";
import { type ControllerError, DecodeError } from "#io/ControllerError.js";

export const toActorIO = (
  a: ActorEntity,
): E.Either<ControllerError, io.http.Actor.Actor> => {
  return pipe(
    io.http.Actor.Actor.decode({
      ...a,
      color: toColor(a.color),
      avatar: a.avatar ? ensureHTTPS(a.avatar) : undefined,
      memberIn: a.memberIn ? a.memberIn : [],
      createdAt: a.createdAt.toISOString(),
      updatedAt: a.updatedAt.toISOString(),
      bornOn: a.bornOn ?? undefined,
      diedOn: a.diedOn ?? undefined,
    }),
    E.mapLeft((e) => DecodeError(`Failed to decode actor (${a.id})`, e)),
  );
};
