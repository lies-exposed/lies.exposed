import { pipe } from "@liexp/core/lib/fp/index.js";
import { UUID } from "@liexp/shared/lib/io/http/Common/UUID.js";
import {
  type _DecodeError,
  DecodeError,
} from "@liexp/shared/lib/io/http/Error/DecodeError.js";
import { type Media } from "@liexp/shared/lib/io/http/Media/Media.js";
import * as io from "@liexp/shared/lib/io/index.js";
import { isValidValue } from "@liexp/shared/lib/providers/blocknote/isValidValue.js";
import { toInitialValue } from "@liexp/shared/lib/providers/blocknote/utils.js";
import { toColor } from "@liexp/shared/lib/utils/colors.js";
import { Schema } from "effect";
import * as E from "fp-ts/lib/Either.js";
import { IOError } from "ts-io-error";
import { type GroupEntity } from "../entities/Group.entity.js";
import { IOCodec } from "./DomainCodec.js";
import { MediaIO } from "./media.io.js";

const toGroupIO = (
  { avatar, old_avatar, ...group }: GroupEntity,
  spaceEndpoint: string,
): E.Either<_DecodeError, io.http.Group.Group> => {
  return pipe(
    E.Do,
    E.bind(
      "avatar",
      (): E.Either<_DecodeError, UUID | Media | undefined> =>
        avatar
          ? Schema.is(UUID)(avatar)
            ? E.right(avatar)
            : MediaIO.decodeSingle(avatar, spaceEndpoint)
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
    decode: toGroupIO,
    encode: () =>
      E.left(
        new IOError("Not implemented", {
          kind: "DecodingError",
          errors: [],
        }),
      ),
  },
  "group",
);
