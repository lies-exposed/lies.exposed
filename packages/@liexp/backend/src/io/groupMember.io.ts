import { pipe } from "@liexp/core/lib/fp/index.js";
import { DecodeError } from "@liexp/io/lib/http/Error/DecodeError.js";
import * as io from "@liexp/io/lib/index.js";
import { isValidValue } from "@liexp/shared/lib/providers/blocknote/isValidValue.js";
import { toInitialValue } from "@liexp/shared/lib/providers/blocknote/utils.js";
import { IOError } from "@ts-endpoint/core";
import { Schema } from "effect";
import { sequenceS } from "fp-ts/lib/Apply.js";
import * as E from "fp-ts/lib/Either.js";
import { type GroupMemberEntity } from "../entities/GroupMember.entity.js";
import { ActorIO } from "./Actor.io.js";
import { IOCodec } from "./DomainCodec.js";
import { GroupIO } from "./group.io.js";

const toGroupMemberIO = (
  groupMember: GroupMemberEntity,
): E.Either<DecodeError, io.http.GroupMember.GroupMember> => {
  return pipe(
    sequenceS(E.Applicative)({
      group: GroupIO.encodeSingle(groupMember.group),
      actor: ActorIO.encodeSingle(groupMember.actor),
    }),
    E.chain(({ group, actor }) =>
      pipe(
        {
          ...groupMember,
          excerpt:
            (groupMember.excerpt && isValidValue(groupMember.excerpt)
              ? toInitialValue(groupMember.excerpt)
              : null) ?? null,
          body:
            (groupMember.body && isValidValue(groupMember.body)
              ? toInitialValue(groupMember.body)
              : null) ?? null,
          actor,
          group,
          startDate: groupMember.startDate ?? new Date(),
          endDate: groupMember.endDate ?? undefined,
          createdAt: groupMember.createdAt,
          updatedAt: groupMember.updatedAt,
          deletedAt: groupMember.deletedAt ?? undefined,
        },
        Schema.validateEither(io.http.GroupMember.GroupMember),
        E.mapLeft((e) =>
          DecodeError.of(
            `Failed to decode group member (${groupMember.id})`,
            e,
          ),
        ),
      ),
    ),
  );
};

export const GroupMemberIO = IOCodec(
  io.http.GroupMember.GroupMember,
  {
    decode: toGroupMemberIO,
    encode: () =>
      E.left(
        new IOError("Not implemented", {
          kind: "DecodingError",
          errors: [],
        }),
      ),
  },
  "GroupMember",
);
