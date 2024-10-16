import { pipe } from "@liexp/core/lib/fp/index.js";
import { AddEndpoint, Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import { sequenceS } from "fp-ts/lib/Apply.js";
import * as O from "fp-ts/lib/Option.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { In, Not } from "typeorm";
import { type Route } from "../route.types.js";
import { StoryIO } from "./story.io.js";
import { StoryEntity } from "#entities/Story.entity.js";
import { getORMOptions } from "#utils/orm.utils.js";

export const MakeListStoryRoute: Route = (r, { env, db, logger }) => {
  AddEndpoint(r)(
    Endpoints.Story.List,
    ({ query: { draft: _draft, exclude: _exclude, ...query } }) => {
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
      return pipe(
        sequenceS(TE.ApplicativeSeq)({
          data: pipe(
            db.find(StoryEntity, {
              ...findOptions,
              where: {
                ...findOptions.where,
                ...draft,
                ...exclude,
              },
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
          total: db.count(StoryEntity),
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
