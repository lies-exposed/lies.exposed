import { io } from "@econnessione/shared";
import { ControllerError, DecodeError } from "@io/ControllerError";
import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/pipeable";
import { GroupEntity } from "./group.entity";

export const toGroupIO = (
  group: GroupEntity
): E.Either<ControllerError, io.http.Group.Group> => {
  return pipe(
    io.http.Group.Group.decode({
      ...group,
      type: "GroupFrontmatter",
      avatar: group.avatar === null ? undefined : group.avatar,
      subGroups: [],
      createdAt: group.createdAt.toISOString(),
      updatedAt: group.updatedAt.toISOString(),
    }),
    E.mapLeft(DecodeError)
  );
};
