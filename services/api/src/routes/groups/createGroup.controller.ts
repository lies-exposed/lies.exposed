import { pipe } from "@liexp/core/lib/fp/index.js";
import { AddEndpoint, Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import { CreateGroupBody } from "@liexp/shared/lib/io/http/Group.js";
import * as O from "fp-ts/lib/Option.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { Equal } from "typeorm";
import { GroupEntity } from "../../entities/Group.entity.js";
import { type Route } from "../route.types.js";
import { GroupIO } from "./group.io.js";
import { searchGroupAndCreateFromWikipedia } from "#flows/groups/fetchGroupFromWikipedia.js";
import { authenticationHandler } from "#utils/authenticationHandler.js";

export const MakeCreateGroupRoute: Route = (r, ctx) => {
  AddEndpoint(r, authenticationHandler(ctx, ["admin:create"]))(
    Endpoints.Group.Create,
    ({ body }) => {
      return pipe(
        CreateGroupBody.is(body)
          ? TE.right(body)
          : searchGroupAndCreateFromWikipedia(ctx)(body.search, "wikipedia"),
        TE.chain(({ color, ...b }) =>
          ctx.db.save(GroupEntity, [
            {
              ...b,
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
        TE.chainEitherK(GroupIO.decodeSingle),
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
