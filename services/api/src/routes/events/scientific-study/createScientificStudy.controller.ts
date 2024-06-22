import { pipe } from "@liexp/core/lib/fp/index.js";
import { AddEndpoint, Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import { UUID } from "@liexp/shared/lib/io/http/Common/index.js";
import {
  CreateScientificStudyBody,
  type CreateScientificStudyPlainBody,
} from "@liexp/shared/lib/io/http/Events/ScientificStudy.js";
import { AdminCreate } from "@liexp/shared/lib/io/http/User.js";
import * as TE from "fp-ts/TaskEither";
import { type DeepPartial, Equal } from "typeorm";
import { EventV2Entity } from "#entities/Event.v2.entity.js";
import { type KeywordEntity } from "#entities/Keyword.entity.js";
import { type MediaEntity } from "#entities/Media.entity.js";
import { UserEntity } from "#entities/User.entity.js";
import { createEventFromURL } from "#flows/events/scientific-studies/createFromURL.flow.js";
import { type ControllerError } from "#io/ControllerError.js";
import { toEventV2IO } from "#routes/events/eventV2.io.js";
import { type Route, type RouteContext } from "#routes/route.types.js";
import { authenticationHandler } from "#utils/authenticationHandler.js";
import { ensureUserExists } from "#utils/user.utils.js";

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
