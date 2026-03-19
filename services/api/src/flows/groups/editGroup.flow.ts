import { type ActorEntity } from "@liexp/backend/lib/entities/Actor.entity.js";
import { type GroupEntity } from "@liexp/backend/lib/entities/Group.entity.js";
import { GroupMemberEntity } from "@liexp/backend/lib/entities/GroupMember.entity.js";
import { GroupIO } from "@liexp/backend/lib/io/group.io.js";
import { GroupRepository } from "@liexp/backend/lib/services/entity-repository.service.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { type UUID, uuid } from "@liexp/io/lib/http/Common/index.js";
import { type EditGroupBody, type Group } from "@liexp/io/lib/http/Group.js";
import * as O from "effect/Option";
import { Equal, In } from "typeorm";
import { type TEReader } from "#flows/flow.types.js";

interface EditGroupInput extends EditGroupBody {
  id: string;
}

export const editGroup = (input: EditGroupInput): TEReader<Group> => {
  const {
    id,
    name,
    username,
    color,
    kind,
    excerpt,
    body,
    avatar,
    startDate,
    endDate,
    members,
  } = input;

  const baseUpdateData = {
    name: O.getOrUndefined(name),
    username: O.getOrUndefined(username),
    color: O.getOrUndefined(color),
    kind: O.getOrUndefined(kind),
    excerpt: O.getOrUndefined(excerpt),
    body: O.getOrUndefined(body),
    startDate: O.getOrUndefined(startDate),
    endDate: O.getOrUndefined(endDate),
    avatar: pipe(
      avatar,
      O.map((a): { id: string } | null => (a !== null ? { id: a } : null)),
      O.getOrUndefined,
    ),
  };

  return pipe(
    GroupRepository.findOneOrFail({ where: { id: Equal(id as any) } }),
    fp.RTE.chain((group) => (ctx) => {
      if (O.isNone(members)) {
        return GroupRepository.save([{ ...group, ...baseUpdateData, id }])(ctx);
      }

      const memberList = members.value;
      const stringIds = memberList.filter(
        (m): m is typeof UUID.Type => typeof m === "string",
      );
      const newStructs = memberList.filter(
        (m): m is Exclude<(typeof memberList)[number], typeof UUID.Type> =>
          typeof m !== "string",
      );
      const newEntities = newStructs.map(
        (member) =>
          ({
            id: uuid(),
            ...member,
            body: O.getOrNull(member.body),
            startDate: member.startDate,
            events: [],
            deletedAt: null,
            updatedAt: new Date(),
            createdAt: new Date(),
            excerpt: O.getOrNull(member.body),
            endDate: O.getOrNull(member.endDate),
            actor: { id: member.actor } as ActorEntity,
            group: { id } as GroupEntity,
          }) as GroupMemberEntity,
      );

      const loadExisting =
        stringIds.length > 0
          ? ctx.db.find(GroupMemberEntity, {
              where: { id: In(stringIds) },
            })
          : fp.TE.right([] as GroupMemberEntity[]);

      return pipe(
        loadExisting,
        fp.TE.chain((existingMembers) =>
          GroupRepository.save([
            {
              ...group,
              ...baseUpdateData,
              id,
              members: [...existingMembers, ...newEntities],
            },
          ])(ctx),
        ),
      );
    }),
    fp.RTE.chain(() =>
      GroupRepository.findOneOrFail({
        where: { id: Equal(id as any) },
        loadRelationIds: {
          relations: ["members"],
        },
      }),
    ),
    fp.RTE.chainEitherK((g) => GroupIO.decodeSingle(g)),
  );
};
