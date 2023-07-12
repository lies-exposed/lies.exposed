import * as io from "@liexp/shared/lib/io";
import { sequenceS } from "fp-ts/Apply";
import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/function";
import { type GroupMemberEntity } from "../../entities/GroupMember.entity";
import { DecodeError, type ControllerError } from "@io/ControllerError";
import { toActorIO } from "@routes/actors/actor.io";
import { toGroupIO } from "@routes/groups/group.io";

export const toGroupMemberIO = (
  groupMember: GroupMemberEntity,
): E.Either<ControllerError, io.http.GroupMember.GroupMember> => {
  return pipe(
    sequenceS(E.Applicative)({
      group: toGroupIO(groupMember.group),
      actor: toActorIO(groupMember.actor),
    }),
    E.chain(({ group, actor }) =>
      pipe(
        io.http.GroupMember.GroupMember.decode({
          ...groupMember,
          actor: io.http.Actor.Actor.encode(actor),
          group: io.http.Group.Group.encode(group),
          startDate: (groupMember.startDate ?? new Date()).toISOString(),
          endDate: groupMember.endDate?.toISOString() ?? undefined,
          createdAt: groupMember.createdAt.toISOString(),
          updatedAt: groupMember.updatedAt.toISOString(),
        }),
        E.mapLeft((e) =>
          DecodeError(`Failed to decode group member (${groupMember.id})`, e),
        ),
      ),
    ),
  );
};
