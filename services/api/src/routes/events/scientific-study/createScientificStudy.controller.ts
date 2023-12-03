import { AddEndpoint, Endpoints } from "@liexp/shared/lib/endpoints";
import {
  CreateScientificStudyBody,
  type CreateScientificStudyPlainBody,
} from "@liexp/shared/lib/io/http/Events/ScientificStudy";
import { AdminCreate } from "@liexp/shared/lib/io/http/User";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { UUID } from "io-ts-types/lib/UUID";
import { type DeepPartial, Equal } from "typeorm";
import { EventV2Entity } from "@entities/Event.v2.entity";
import { type KeywordEntity } from "@entities/Keyword.entity";
import { type MediaEntity } from "@entities/Media.entity";
import { UserEntity } from "@entities/User.entity";
import { createEventFromURL } from "@flows/events/scientific-studies/createFromURL.flow";
import { type ControllerError } from "@io/ControllerError";
import { toEventV2IO } from "@routes/events/eventV2.io";
import { type Route, type RouteContext } from "@routes/route.types";
import { authenticationHandler } from "@utils/authenticationHandler";
import { ensureUserExists } from "@utils/user.utils";

const createScientificStudyFromPlainObject =
  (ctx: RouteContext) =>
  ({
    payload,
    ...body
  }: CreateScientificStudyPlainBody): TE.TaskEither<
    ControllerError,
    EventV2Entity
  > => {
    const scientificStudyData = {
      ...body,
      links: body.links.map((l) => {
        if (UUID.is(l)) {
          return {
            id: l,
          };
        }
        return {
          ...l,
        };
      }),
      media: body.media.map((l) => {
        if (UUID.is(l)) {
          return {
            id: l,
          };
        }
        return {
          ...l,
        };
      }) as DeepPartial<MediaEntity[]>,
      keywords: body.media.map((l) => {
        if (UUID.is(l)) {
          return {
            id: l,
          };
        }
        return {
          ...l,
        };
      }) as DeepPartial<KeywordEntity[]>,
      payload,
    };

    return pipe(
      ctx.db.save(EventV2Entity, [
        {
          ...scientificStudyData,
        },
      ]),
      TE.chain(([result]) =>
        ctx.db.findOneOrFail(EventV2Entity, {
          where: { id: Equal(result.id) },
          loadRelationIds: {
            relations: ["media", "links", "keywords"],
          },
        }),
      ),
    );
  };

export const MakeCreateScientificStudyRoute: Route = (r, ctx) => {
  AddEndpoint(r, authenticationHandler(ctx, [AdminCreate.value]))(
    Endpoints.ScientificStudy.Create,
    ({ body }, req) => {
      const scientificStudyTask = CreateScientificStudyBody.types[1].is(body)
        ? pipe(
            ensureUserExists(req.user),
            TE.fromEither,
            TE.map((u) => {
              const user = new UserEntity();
              user.id = u.id;
              return user;
            }),
            TE.chain((u) => createEventFromURL(ctx)(u, body.url)),
          )
        : createScientificStudyFromPlainObject(ctx)(body);

      return pipe(
        scientificStudyTask,
        TE.chainEitherK(toEventV2IO),
        TE.map((data) => ({
          body: {
            data,
          },
          statusCode: 201,
        })),
      );
    },
  );
};
