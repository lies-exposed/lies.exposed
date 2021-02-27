import * as io  from "@econnessione/shared/io";
import { ControllerError, DecodeError } from "@io/ControllerError";
import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/pipeable";
import { GroupMemberEntity } from "../../entities/GroupMember.entity";

export const toGroupMemberIO = (
  group: GroupMemberEntity
): E.Either<ControllerError, io.http.GroupMember.GroupMember> => {
  return pipe(
    io.http.GroupMember.GroupMember.decode({
      ...group,
      startDate: group.startDate.toISOString(),
      endDate: group.endDate?.toISOString(),
      createdAt: group.createdAt.toISOString(),
      updatedAt: group.updatedAt.toISOString(),
    }),
    E.mapLeft(DecodeError)
  );
};
