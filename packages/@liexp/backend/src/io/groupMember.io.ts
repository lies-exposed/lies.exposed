import { pipe } from "@liexp/core/lib/fp/index.js";
import {
  type _DecodeError,
  DecodeError,
} from "@liexp/shared/lib/io/http/Error/DecodeError.js";
import * as io from "@liexp/shared/lib/io/index.js";
import { isValidValue } from "@liexp/shared/lib/providers/blocknote/isValidValue.js";
import { toInitialValue } from "@liexp/shared/lib/providers/blocknote/utils.js";
import { Schema } from "effect";
import { sequenceS } from "fp-ts/lib/Apply.js";
import * as E from "fp-ts/lib/Either.js";
import { IOError } from "ts-io-error";
import { type GroupMemberEntity } from "../entities/GroupMember.entity.js";
import { ActorIO } from "./Actor.io.js";
import { IOCodec } from "./DomainCodec.js";
import { GroupIO } from "./group.io.js";

const toGroupMemberIO = (
  groupMember: GroupMemberEntity,
  spaceEndpoint: string,
): E.Either<_DecodeError, io.http.GroupMember.GroupMember> => {
  return pipe(
    sequenceS(E.Applicative)({
      group: GroupIO.decodeSingle(groupMember.group, spaceEndpoint),
      actor: ActorIO.decodeSingle(groupMember.actor, spaceEndpoint),
    }),
    E.chain(({ group, actor }) =>
      pipe(
        {
          ...groupMember,
          excerpt:
            groupMember.excerpt && isValidValue(groupMember.excerpt)
              ? toInitialValue(groupMember.excerpt)
              : null,
          body:
            groupMember.body && isValidValue(groupMember.body)
              ? toInitialValue(groupMember.body)
              : null,
          actor,
          group,
          startDate: (groupMember.startDate ?? new Date()).toISOString(),
          endDate: groupMember.endDate?.toISOString() ?? undefined,
          createdAt: groupMember.createdAt.toISOString(),
          updatedAt: groupMember.updatedAt.toISOString(),
        },
        Schema.decodeUnknownEither(io.http.GroupMember.GroupMember),
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
