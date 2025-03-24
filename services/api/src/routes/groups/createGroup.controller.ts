import { GroupEntity } from "@liexp/backend/lib/entities/Group.entity.js";
import { GroupIO } from "@liexp/backend/lib/io/group.io.js";
import { SearchFromWikipediaPubSub } from "@liexp/backend/lib/pubsub/searchFromWikipedia.pubSub.js";
import { pipe } from "@liexp/core/lib/fp/index.js";
import { Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import { GROUP } from "@liexp/shared/lib/io/http/Common/BySubject.js";
import { CreateGroupBody } from "@liexp/shared/lib/io/http/Group.js";
import { Schema } from "effect";
import * as O from "fp-ts/lib/Option.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { Equal } from "typeorm";
import { type Route } from "../route.types.js";
import { AddEndpoint } from "#routes/endpoint.subscriber.js";
import { authenticationHandler } from "#utils/authenticationHandler.js";

export const MakeCreateGroupRoute: Route = (r, ctx) => {
  AddEndpoint(r, authenticationHandler(["admin:create"])(ctx))(
    Endpoints.Group.Create,
    ({ body }) => {
      return pipe(
        Schema.is(CreateGroupBody)(body)
          ? pipe(
              TE.right(body),
              TE.chain(({ color, avatar, ...b }) =>
                ctx.db.save(GroupEntity, [
                  {
                    ...b,
                    avatar: { id: avatar },
                    color: color.replace("#", ""),
                    members: b.members.map((m) => ({
                      ...m,
                      actor: { id: m.actor },
                      endDate: O.toNullable(m.endDate),
                    })),
                  },
                ]),
              ),
              TE.chain(([group]) =>
                ctx.db.findOneOrFail(GroupEntity, {
                  where: { id: Equal(group.id) },
                }),
              ),
            )
          : pipe(
              SearchFromWikipediaPubSub.publish({
                search: body.search,
                provider: "wikipedia",
                type: GROUP.Type,
              })(ctx),
              TE.map(() => new GroupEntity()),
            ),
        TE.chainEitherK((g) => GroupIO.decodeSingle(g, ctx.env.SPACE_ENDPOINT)),
        TE.map((data) => ({
          body: {
            data,
          },
          statusCode: 200,
        })),
      );
    },
  );
};
