import { pipe } from "@liexp/core/lib/fp/index.js";
import { UUID } from "@liexp/shared/lib/io/http/Common/index.js";
import { type CreateScientificStudyPlainBody } from "@liexp/shared/lib/io/http/Events/ScientificStudy.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { type DeepPartial, Equal } from "typeorm";
import { EventV2Entity } from "#entities/Event.v2.entity.js";
import { type KeywordEntity } from "#entities/Keyword.entity.js";
import { type MediaEntity } from "#entities/Media.entity.js";
import { type TEReader } from "#flows/flow.types.js";

export const createScientificStudyFromPlainObject =
  ({
    payload,
    ...body
  }: CreateScientificStudyPlainBody): TEReader<EventV2Entity> =>
  (ctx) => {
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
