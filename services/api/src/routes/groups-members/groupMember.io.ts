import { pipe } from "@liexp/core/lib/fp/index.js";
import * as io from "@liexp/shared/lib/io/index.js";
import { sequenceS } from "fp-ts/lib/Apply.js";
import * as E from "fp-ts/lib/Either.js";
import { type GroupMemberEntity } from "../../entities/GroupMember.entity.js";
import { DecodeError, type ControllerError } from "#io/ControllerError.js";
import { toActorIO } from "#routes/actors/actor.io.js";
import { toGroupIO } from "#routes/groups/group.io.js";

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
