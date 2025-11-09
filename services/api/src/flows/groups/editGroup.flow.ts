import { type ActorEntity } from "@liexp/backend/lib/entities/Actor.entity.js";
import { type GroupEntity } from "@liexp/backend/lib/entities/Group.entity.js";
import { type GroupMemberEntity } from "@liexp/backend/lib/entities/GroupMember.entity.js";
import { GroupIO } from "@liexp/backend/lib/io/group.io.js";
import { GroupRepository } from "@liexp/backend/lib/services/entity-repository.service.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { uuid } from "@liexp/shared/lib/io/http/Common/index.js";
import {
  type EditGroupBody,
  type Group,
} from "@liexp/shared/lib/io/http/Group.js";
import * as O from "effect/Option";
import { Equal } from "typeorm";
import { type TEReader } from "#flows/flow.types.js";

export interface EditGroupInput extends EditGroupBody {
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

  const updateData = {
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
      O.map((a) => ({ id: a })),
      O.getOrUndefined,
    ),
    members: pipe(
      members,
      O.map((m) =>
        m.map((member) => {
          if (typeof member === "string") {
            return {
              id: member,
              group: { id },
            };
          }
          return {
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
          } as GroupMemberEntity;
        }),
      ),
      O.getOrElse(() => []),
    ),
  };

  return pipe(
    GroupRepository.findOneOrFail({ where: { id: Equal(id as any) } }),
    fp.RTE.chain((group) =>
      GroupRepository.save([{ ...group, ...updateData, id }]),
    ),
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
