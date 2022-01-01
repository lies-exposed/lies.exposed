import * as io from "@econnessione/shared/io";
import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/pipeable";
import { GroupEntity } from "../../entities/Group.entity";
import { ControllerError, DecodeError } from "@io/ControllerError";

export const toGroupIO = (
  group: GroupEntity
): E.Either<ControllerError, io.http.Group.Group> => {
  return pipe(
    io.http.Group.Group.decode({
      ...group,
      type: "GroupFrontmatter",
      avatar: group.avatar === null ? undefined : group.avatar,
      members: group.members ? group.members : [],
      subGroups: [],
      createdAt: group.createdAt.toISOString(),
      updatedAt: group.updatedAt.toISOString(),
    }),
    E.mapLeft(e => DecodeError(`Failed to decode group (${group.id})`, e))
  );
};
