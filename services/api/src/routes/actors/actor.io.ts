import * as io from "@liexp/shared/lib/io";
import { toColor } from "@liexp/shared/lib/utils/colors";
import { ensureHTTPS } from "@liexp/shared/lib/utils/media.utils";
import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/function";
import { type ActorEntity } from "../../entities/Actor.entity";
import { type ControllerError, DecodeError } from "@io/ControllerError";

export const toActorIO = (
  a: ActorEntity,
): E.Either<ControllerError, io.http.Actor.Actor> => {
  return pipe(
    io.http.Actor.Actor.decode({
      ...a,
      family: a.family ?? null,
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
