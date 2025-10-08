import { StoryEntity } from "@liexp/backend/lib/entities/Story.entity.js";
import { StoryIO } from "@liexp/backend/lib/io/story.io.js";
import { getORMOptions } from "@liexp/backend/lib/utils/orm.utils.js";
import { pipe } from "@liexp/core/lib/fp/index.js";
import { Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import { sequenceS } from "fp-ts/lib/Apply.js";
import * as O from "fp-ts/lib/Option.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { In, Not } from "typeorm";
import { type Route } from "../route.types.js";
import { AddEndpoint } from "#routes/endpoint.subscriber.js";

export const MakeListStoryRoute: Route = (r, { env, db, logger: _logger }) => {
  AddEndpoint(r)(
    Endpoints.Story.List,
    ({
      query: {
        draft: _draft,
        exclude: _exclude,
        withDeleted: _withDeleted,
        ...query
      },
    }) => {
      const findOptions = getORMOptions({ ...query }, env.DEFAULT_PAGE_SIZE);
      const draft = pipe(
        _draft,
        O.map((d) => ({ draft: d })),
        O.getOrElse(() => ({})),
      );

      const exclude = pipe(
        _exclude,
        O.map((e) => ({
          id: Not(In(e)),
        })),
        O.getOrElse(() => ({})),
      );
      const withDeleted = pipe(
        _withDeleted,
        O.filter((deleted) => !!deleted),
        O.getOrElse(() => false),
      );
      return pipe(
        sequenceS(TE.ApplicativePar)({
          data: pipe(
            db.find(StoryEntity, {
              ...findOptions,
              where: {
                ...findOptions.where,
                ...draft,
                ...exclude,
              },
              withDeleted,
              relations: ["featuredImage"],
              loadRelationIds: {
                relations: [
                  "creator",
                  "keywords",
                  "media",
                  "links",
                  "actors",
                  "groups",
                  "events",
                ],
              },
            }),
            TE.chainEitherK(StoryIO.decodeMany),
          ),
          total: db.count(StoryEntity, { withDeleted }),
        }),
        TE.map(({ data, total }) => ({
          body: {
            data,
            total,
          },
          statusCode: 200,
        })),
      );
    },
  );
};
