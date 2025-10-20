import { GroupEntity } from "@liexp/backend/lib/entities/Group.entity.js";
import { GroupIO } from "@liexp/backend/lib/io/group.io.js";
import { SearchFromWikipediaPubSub } from "@liexp/backend/lib/pubsub/searchFromWikipedia.pubSub.js";
import { fp } from "@liexp/core/lib/fp/index.js";
import { GROUP } from "@liexp/shared/lib/io/http/Common/index.js";
import {
  AddGroupBody,
  type CreateGroupBody,
  type Group,
} from "@liexp/shared/lib/io/http/Group.js";
import { Schema } from "effect";
import { pipe } from "fp-ts/lib/function.js";
import { Equal } from "typeorm";
import { type TEReader } from "../flow.types.js";

export const createGroup =
  (body: CreateGroupBody): TEReader<Group | { success: true }> =>
  (ctx) => {
    if (Schema.is(AddGroupBody)(body)) {
      return pipe(
        fp.TE.right(body),
        fp.TE.chain(({ color, avatar, ...b }) =>
          ctx.db.save(GroupEntity, [
            {
              ...b,
              avatar: { id: avatar },
              color: color.replace("#", ""),
              members: b.members.map((m) => ({
                ...m,
                actor: { id: m.actor },
                endDate: fp.O.toNullable(m.endDate),
              })),
            },
          ]),
        ),
        fp.TE.chain(([group]) =>
          ctx.db.findOneOrFail(GroupEntity, {
            where: { id: Equal(group.id) },
          }),
        ),
        fp.TE.chainEitherK((g) => GroupIO.decodeSingle(g)),
      );
    }

    return pipe(
      SearchFromWikipediaPubSub.publish({
        search: body.search,
        provider: "wikipedia",
        type: GROUP.literals[0],
      })(ctx),
      fp.TE.map(() => ({ success: true })),
    );
  };
