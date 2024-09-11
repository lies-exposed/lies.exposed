import { pipe } from "@liexp/core/lib/fp/index.js";
import * as io from "@liexp/shared/lib/io/index.js";
import { toColor } from "@liexp/shared/lib/utils/colors.js";
import { toInitialValue } from "@liexp/ui/lib/components/Common/BlockNote/utils/utils.js";
import * as E from "fp-ts/lib/Either.js";
import { type GroupEntity } from "#entities/Group.entity.js";
import { DecodeError, type ControllerError } from "#io/ControllerError.js";
import { IOCodec } from "#io/DomainCodec.js";
import { MediaIO } from "#routes/media/media.io.js";

const toGroupIO = (
  { avatar, old_avatar, ...group }: GroupEntity,
  spaceEndpoint: string,
): E.Either<ControllerError, io.http.Group.Group> => {
  return pipe(
    E.Do,
    E.bind("avatar", () =>
      avatar ? MediaIO.decodeSingle(avatar, spaceEndpoint) : E.right(undefined),
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
          avatar: avatar
            ? {
                ...avatar,
                createdAt: avatar.createdAt.toISOString(),
                updatedAt: avatar.updatedAt.toISOString(),
              }
            : undefined,
          members: group.members ? group.members : [],
          subGroups: [],
          createdAt: group.createdAt.toISOString(),
          updatedAt: group.updatedAt.toISOString(),
          deletedAt: group.deletedAt?.toISOString(),
        }),
        E.mapLeft((e) =>
          DecodeError(`Failed to decode group (${group.id})`, e),
        ),
      ),
    ),
  );
};

export const GroupIO = IOCodec(toGroupIO, "group");
