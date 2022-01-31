import * as io from "@econnessione/shared/io";
import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/pipeable";
import { ActorEntity } from "../../entities/Actor.entity";
import { ControllerError, DecodeError } from "@io/ControllerError";
import { toColor } from '@econnessione/shared/io/http/Common';

export const toActorIO = (
  a: ActorEntity
): E.Either<ControllerError, io.http.Actor.Actor> => {
  return pipe(
    io.http.Actor.Actor.decode({
      ...a,
      color: toColor(a.color),
      avatar: a.avatar ?? undefined,
      memberIn: a.memberIn ? a.memberIn : [],
      createdAt: a.createdAt.toISOString(),
      updatedAt: a.updatedAt.toISOString(),
    }),
    E.mapLeft((e) => DecodeError(`Failed to decode actor (${a.id})`, e))
  );
};
