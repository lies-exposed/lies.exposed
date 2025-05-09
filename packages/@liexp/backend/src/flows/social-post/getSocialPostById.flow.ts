import { pipe } from "@liexp/core/lib/fp/index.js";
import { UUID } from "@liexp/shared/lib/io/http/Common/UUID.js";
import { Schema } from "effect";
import { type ReaderTaskEither } from "fp-ts/lib/ReaderTaskEither.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { type DatabaseContext } from "../../context/db.context.js";
import { type ENVContext } from "../../context/env.context.js";
import { type LoggerContext } from "../../context/logger.context.js";
import { SocialPostEntity } from "../../entities/SocialPost.entity.js";
import { type ServerError } from "../../errors/ServerError.js";
import { type SocialPostEntityWithContent } from "../../io/socialPost.io.js";
import { fetchSocialPostRelations } from "./fetchSocialPostRelations.flow.js";

export const getSocialPostById =
  <C extends DatabaseContext & ENVContext & LoggerContext>(
    id: UUID,
  ): ReaderTaskEither<C, ServerError, SocialPostEntityWithContent> =>
  (ctx) =>
    pipe(
      TE.Do,
      TE.bind("sp", () =>
        ctx.db.findOneOrFail(SocialPostEntity, {
          where: {
            id,
          },
        }),
      ),
      TE.bind("content", ({ sp: { content: d } }) =>
        pipe(
          {
            ...d,
            media: (Array.isArray(d.media) ? d.media : []).filter(
              Schema.is(UUID),
            ),
            actors: (d.actors ?? []).filter(Schema.is(UUID)),
            groups: (d.groups ?? []).filter(Schema.is(UUID)),
            keywords: (d.keywords ?? []).filter(Schema.is(UUID)),
          },
          TE.right<ServerError, SocialPostEntity["content"]>,
        ),
      ),
      TE.bind("relations", ({ content }) =>
        fetchSocialPostRelations(content)(ctx),
      ),
      TE.map(({ sp, relations }) => ({
        ...sp,
        content: {
          ...sp.content,
          ...relations,
          media: relations.media.map((m) => ({
            ...m,
            links: [],
            areas: [],
            events: [],
          })),
        },
        id,
      })),
    );
