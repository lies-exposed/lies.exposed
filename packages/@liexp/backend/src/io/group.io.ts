import { flow, pipe } from "@liexp/core/lib/fp/index.js";
import { UUID } from "@liexp/shared/lib/io/http/Common/UUID.js";
import {
  type _DecodeError,
  DecodeError,
} from "@liexp/shared/lib/io/http/Error/DecodeError.js";
import * as io from "@liexp/shared/lib/io/index.js";
import { isValidValue } from "@liexp/shared/lib/providers/blocknote/isValidValue.js";
import { toInitialValue } from "@liexp/shared/lib/providers/blocknote/utils.js";
import { toColor } from "@liexp/shared/lib/utils/colors.js";
import { Schema } from "effect";
import * as E from "fp-ts/lib/Either.js";
import { type GroupEntity } from "../entities/Group.entity.js";
import { IOCodec } from "./DomainCodec.js";
import { MediaIO } from "./media.io.js";

const encodeGroupIO = ({
  avatar,
  old_avatar: _old_avatar,
  ...group
}: GroupEntity): E.Either<
  _DecodeError,
  Schema.Schema.Encoded<typeof io.http.Group.Group>
> => {
  return pipe(
    E.Do,
    E.bind(
      "avatar",
      (): E.Either<_DecodeError, io.http.Media.Media | undefined> =>
        avatar ? pipe(MediaIO.decodeSingle(avatar)) : E.right(undefined),
    ),
    E.map(({ avatar }) => ({
      ...group,
      excerpt:
        (group.excerpt && isValidValue(group.excerpt)
          ? toInitialValue(group.excerpt)
          : null) ?? null,
      body:
        (group.body && isValidValue(group.body)
          ? toInitialValue(group.body)
          : null) ?? null,
      avatar,
      subGroups: [],
      username: group.username ?? undefined,
      startDate: group.startDate ?? undefined,
      endDate: group.endDate ?? undefined,
      members: group.members ? group.members.map((m) => m.id) : [],
    })),
    E.chain(
      flow(
        Schema.encodeEither(io.http.Group.Group),
        E.mapLeft((e) =>
          DecodeError.of(`Failed to decode group (${group.id})`, e),
        ),
      ),
    ),
  );
};
const decodeGroupIO = ({
  avatar,
  old_avatar: _old_avatar,
  ...group
}: GroupEntity): E.Either<_DecodeError, io.http.Group.Group> => {
  return pipe(
    E.Do,
    E.bind(
      "avatar",
      (): E.Either<
        _DecodeError,
        UUID | Schema.Schema.Encoded<typeof io.http.Media.Media> | undefined
      > =>
        avatar
          ? Schema.is(UUID)(avatar)
            ? E.right(avatar)
            : pipe(MediaIO.encodeSingle(avatar))
          : E.right(undefined),
    ),
    E.chain(({ avatar }) =>
      pipe(
        {
          ...group,
          username: group.username ?? undefined,
          startDate: group.startDate?.toISOString() ?? undefined,
          endDate: group.endDate?.toISOString() ?? undefined,
          color: toColor(group.color),
          excerpt:
            group.excerpt && isValidValue(group.excerpt)
              ? toInitialValue(group.excerpt)
              : null,
          body:
            group.body && isValidValue(group.body)
              ? toInitialValue(group.body)
              : null,
          avatar,
          members: group.members ? group.members : [],
          subGroups: [],
          createdAt: group.createdAt.toISOString(),
          updatedAt: group.updatedAt.toISOString(),
          deletedAt: group.deletedAt?.toISOString(),
        },
        Schema.decodeUnknownEither(io.http.Group.Group),
        E.mapLeft((e) =>
          DecodeError.of(`Failed to decode group (${group.id})`, e),
        ),
      ),
    ),
  );
};

export const GroupIO = IOCodec(
  io.http.Group.Group,
  {
    decode: decodeGroupIO,
    encode: encodeGroupIO,
  },
  "group",
);
