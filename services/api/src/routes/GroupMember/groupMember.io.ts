import * as io from "@econnessione/shared/io";
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
      group: {
        ...group.group,
        type: "GroupFrontmatter",
        members: [],
        subGroups: [],
        createdAt: group.group.createdAt.toISOString(),
        updatedAt: group.group.updatedAt.toISOString(),
      },
      actor: {
        ...group.actor,
        avatar: group.actor.avatar ?? undefined,
        createdAt: group.actor.createdAt.toISOString(),
        updatedAt: group.actor.updatedAt.toISOString(),
      },
      startDate: group.startDate.toISOString(),
      endDate: group.endDate?.toISOString(),
      createdAt: group.createdAt.toISOString(),
      updatedAt: group.updatedAt.toISOString(),
    }),
    E.mapLeft(DecodeError)
  );
};
