import * as io from "@econnessione/shared/io";
import { toColor } from "@econnessione/shared/io/http/Common";
import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import { GroupMemberEntity } from "../../entities/GroupMember.entity";
import { ControllerError, DecodeError } from "@io/ControllerError";

export const toGroupMemberIO = (
  groupMember: GroupMemberEntity
): E.Either<ControllerError, io.http.GroupMember.GroupMember> => {
  return pipe(
    io.http.GroupMember.GroupMember.decode({
      ...groupMember,
      actor: {
        ...groupMember.actor,
        color: toColor(groupMember.actor.color),
        avatar: groupMember.actor?.avatar ?? undefined,
        memberIn: [],
        createdAt: groupMember.actor?.createdAt.toISOString(),
        updatedAt: groupMember.actor?.updatedAt.toISOString(),
      },
      group: {
        ...groupMember.group,
        color: toColor(groupMember.group.color),
        subGroups: [],
        members: [],
        avatar: groupMember.group?.avatar ?? undefined,
        createdAt: groupMember.group?.createdAt.toISOString(),
        updatedAt: groupMember.group?.updatedAt.toISOString(),
      },
      startDate: (groupMember.startDate ?? new Date()).toISOString(),
      endDate: groupMember.endDate?.toISOString() ?? undefined,
      createdAt: groupMember.createdAt.toISOString(),
      updatedAt: groupMember.updatedAt.toISOString(),
    }),
    E.mapLeft((e) =>
      DecodeError(`Failed to decode group member (${groupMember.id})`, e)
    )
  );
};
