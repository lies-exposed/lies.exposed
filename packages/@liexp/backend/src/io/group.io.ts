import { pipe } from "@liexp/core/lib/fp/index.js";
import {
  type _DecodeError,
  DecodeError,
} from "@liexp/shared/lib/io/http/Error/DecodeError.js";
import { Media } from "@liexp/shared/lib/io/http/Media/Media.js";
import * as io from "@liexp/shared/lib/io/index.js";
import { toInitialValue } from "@liexp/shared/lib/providers/blocknote/utils.js";
import { toColor } from "@liexp/shared/lib/utils/colors.js";
import * as E from "fp-ts/lib/Either.js";
import { UUID } from "io-ts-types";
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
          ? UUID.is(avatar)
            ? E.right(avatar)
            : pipe(
                MediaIO.decodeSingle(avatar, spaceEndpoint),
                E.map((media) => Media.encode(media) as any as Media),
              )
          : E.right(undefined),
    ),
    E.chain(({ avatar }) =>
      pipe(
        io.http.Group.Group.decode({
          ...group,
          username: group.username ?? undefined,
          startDate: group.startDate?.toISOString() ?? undefined,
          endDate: group.endDate?.toISOString() ?? undefined,
          color: toColor(group.color),
          excerpt: toInitialValue(group.excerpt) ?? null,
          body: toInitialValue(group.body) ?? null,
          avatar,
          members: group.members ? group.members : [],
          subGroups: [],
          createdAt: group.createdAt.toISOString(),
          updatedAt: group.updatedAt.toISOString(),
          deletedAt: group.deletedAt?.toISOString(),
        }),
        E.mapLeft((e) =>
          DecodeError.of(`Failed to decode group (${group.id})`, e),
        ),
      ),
    ),
  );
};

export const GroupIO = IOCodec(toGroupIO, "group");
