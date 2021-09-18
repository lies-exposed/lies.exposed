import * as io from "@econnessione/shared/io";
import { ControllerError, DecodeError } from "@io/ControllerError";
import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/pipeable";
import { GroupMemberEntity } from "../../entities/GroupMember.entity";

export const toGroupMemberIO = (
  groupMember: GroupMemberEntity
): E.Either<ControllerError, io.http.GroupMember.GroupMember> => {
  return pipe(
    io.http.GroupMember.GroupMember.decode({
      ...groupMember,
      actor: {
        ...groupMember.actor,
        avatar: groupMember.actor?.avatar ?? undefined,
        memberIn: [],
        createdAt: groupMember.actor?.createdAt.toISOString(),
        updatedAt: groupMember.actor?.updatedAt.toISOString(),
      },
      group: {
        ...groupMember.group,
        subGroups: [],
        members: [],
        avatar: groupMember.group?.avatar ?? undefined,
        createdAt: groupMember.group?.createdAt.toISOString(),
        updatedAt: groupMember.group?.updatedAt.toISOString(),
      },
      startDate: groupMember.startDate.toISOString(),
      endDate: groupMember.endDate?.toISOString() ?? undefined,
      createdAt: groupMember.createdAt.toISOString(),
      updatedAt: groupMember.updatedAt.toISOString(),
    }),
    E.mapLeft(DecodeError)
  );
};
