import * as io from "@liexp/shared/lib/io";
import { toColor } from "@liexp/shared/lib/utils/colors";
import { ensureHTTPS } from '@liexp/shared/lib/utils/media.utils';
import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/function";
import { type GroupEntity } from "../../entities/Group.entity";
import { DecodeError, type ControllerError } from "@io/ControllerError";

export const toGroupIO = (
  group: GroupEntity,
): E.Either<ControllerError, io.http.Group.Group> => {
  return pipe(
    io.http.Group.Group.decode({
      ...group,
      username: group.username ?? undefined,
      startDate: group.startDate?.toISOString() ?? undefined,
      endDate: group.endDate?.toISOString() ?? undefined,
      color: toColor(group.color),
      avatar: group.avatar ? ensureHTTPS(group.avatar) : undefined,
      members: group.members ? group.members : [],
      subGroups: [],
      createdAt: group.createdAt.toISOString(),
      updatedAt: group.updatedAt.toISOString(),
    }),
    E.mapLeft((e) => DecodeError(`Failed to decode group (${group.id})`, e)),
  );
};
