import { AddEndpoint, Endpoints } from "@liexp/shared/lib/endpoints";
import { CreateGroupBody } from "@liexp/shared/lib/io/http/Group";
import * as O from "fp-ts/Option";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { Equal } from "typeorm";
import { GroupEntity } from "../../entities/Group.entity";
import { type Route } from "../route.types";
import { toGroupIO } from "./group.io";
import { fetchGroupFromWikipedia } from "@flows/groups/fetchGroupFromWikipedia";
import { authenticationHandler } from "@utils/authenticationHandler";

export const MakeCreateGroupRoute: Route = (r, ctx) => {
  AddEndpoint(r, authenticationHandler(ctx, ["admin:create"]))(
    Endpoints.Group.Create,
    ({ body }) => {
      return pipe(
        CreateGroupBody.is(body)
          ? TE.right(body)
          : fetchGroupFromWikipedia(ctx)(body.search),
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
          ])
        ),
        TE.chain(([group]) =>
          ctx.db.findOneOrFail(GroupEntity, {
            where: { id: Equal(group.id) },
          })
        ),
        TE.chainEitherK(toGroupIO),
        TE.map((data) => ({
          body: {
            data,
          },
          statusCode: 200,
        }))
      );
    }
  );
};
