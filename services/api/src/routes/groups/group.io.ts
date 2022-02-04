import * as io from "@econnessione/shared/io";
import { toColor } from '@econnessione/shared/io/http/Common';
import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import { GroupEntity } from "../../entities/Group.entity";
import { ControllerError, DecodeError } from "@io/ControllerError";

export const toGroupIO = (
  group: GroupEntity
): E.Either<ControllerError, io.http.Group.Group> => {
  return pipe(
    io.http.Group.Group.decode({
      ...group,
      color: toColor(group.color),
      avatar: group.avatar === null ? undefined : group.avatar,
      members: group.members ? group.members : [],
      subGroups: [],
      createdAt: group.createdAt.toISOString(),
      updatedAt: group.updatedAt.toISOString(),
    }),
    E.mapLeft((e) => DecodeError(`Failed to decode group (${group.id})`, e))
  );
};
