import * as io from "@liexp/shared/lib/io";
import { toColor } from "@liexp/shared/lib/io/http/Common";
import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/function";
import { type GroupEntity } from "../../entities/Group.entity";
import { type ControllerError, DecodeError } from "@io/ControllerError";

export const toGroupIO = (
  group: GroupEntity
): E.Either<ControllerError, io.http.Group.Group> => {
  return pipe(
    io.http.Group.Group.decode({
      ...group,
      startDate: group.startDate?.toISOString() ?? undefined,
      endDate: group.endDate?.toISOString() ?? undefined,
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
