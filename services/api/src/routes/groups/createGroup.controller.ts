import { AddEndpoint, Endpoints } from "@econnessione/shared/endpoints";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/pipeable";
import { GroupEntity } from "../../entities/Group.entity";
import { Route } from "routes/route.types";

export const MakeCreateGroupRoute: Route = (r, { s3, db, env }) => {
  AddEndpoint(r)(Endpoints.Group.Create, ({ body: { color, ...body } }) => {
    return pipe(
      db.save(GroupEntity, [
        {
          ...body,
          color: color.replace("#", ""),
          members: body.members.map((m) => ({
            id: m
          })),
        },
      ]),
      TE.chain(([group]) =>
        db.findOneOrFail(GroupEntity, {
          where: { id: group.id },
        })
      ),
      TE.map((group) => ({
        body: {
          data: {
            ...group,
            type: "GroupEntity" as const,
            // members: (page.members as any) as string[],
            // subGroups: (page.subGroups as any) as string[],
            createdAt: group.createdAt.toISOString(),
            updatedAt: group.updatedAt.toISOString(),
            events: []
          },
        },
        statusCode: 200,
      }))
    );
  });
};
