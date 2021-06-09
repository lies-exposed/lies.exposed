import * as io from "@econnessione/shared/io";
import { ControllerError, DecodeError } from "@io/ControllerError";
import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/pipeable";
import { GroupEntity } from "../../entities/Group.entity";

export const toGroupIO = (
  group: GroupEntity
): E.Either<ControllerError, io.http.Group.Group> => {
  return pipe(
    io.http.Group.Group.decode({
      ...group,
      type: "GroupFrontmatter",
      avatar: group.avatar === null ? undefined : group.avatar,
      members: group.members ?? [],
      subGroups: [],
      createdAt: group.createdAt.toISOString(),
      updatedAt: group.updatedAt.toISOString(),
    }),
    E.mapLeft(DecodeError)
  );
};
