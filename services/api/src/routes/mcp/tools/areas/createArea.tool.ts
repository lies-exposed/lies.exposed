import { AreaIO } from "@liexp/backend/lib/io/Area.io.js";
import { AreaRepository } from "@liexp/backend/lib/services/entity-repository.service.js";
import { LoggerService } from "@liexp/backend/lib/services/logger/logger.service.js";
import { fp } from "@liexp/core/lib/fp/index.js";
import type { CreateAreaBody } from "@liexp/shared/lib/io/http/Area.js";
import { toInitialValue } from "@liexp/shared/lib/providers/blocknote/utils.js";
import { type CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { Schema } from "effect";
import { type ReaderTaskEither } from "fp-ts/lib/ReaderTaskEither.js";
import { pipe } from "fp-ts/lib/function.js";
import { Equal } from "typeorm";
import { type ServerContext } from "../../../../context/context.type.js";
import { formatAreaToMarkdown } from "../formatters/areaToMarkdown.formatter.js";

export const CreateAreaInputSchema = Schema.Struct({
  label: Schema.String.annotations({
    description: "Label/name of the area",
  }),
  slug: Schema.String.annotations({
    description: "Unique URL-friendly slug for the area",
  }),
  draft: Schema.Boolean.annotations({
    description: "Whether the area is a draft (true/false)",
  }),
  body: Schema.String.annotations({
    description: "Description/body content of the area",
  }),
  geometry: Schema.Struct({
    type: Schema.Literal("Point").annotations({
      description: "Geometry type (currently only Point is supported)",
    }),
    coordinates: Schema.Array(Schema.Number).annotations({
      description: "Coordinates tuple [longitude, latitude]",
    }),
  }).annotations({
    description: "Geographic geometry of the area",
  }),
});
export type CreateAreaInputSchema = typeof CreateAreaInputSchema.Type;

export const createAreaToolTask = ({
  label,
  slug,
  draft,
  body,
  geometry,
}: CreateAreaInputSchema): ReaderTaskEither<
  ServerContext,
  Error,
  CallToolResult
> => {
  const areaBody: CreateAreaBody = {
    label,
    slug,
    draft,
    body: toInitialValue(body),
    geometry:
      geometry.type === "Point" && geometry.coordinates.length === 2
        ? {
            type: geometry.type,
            coordinates: [geometry.coordinates[0], geometry.coordinates[1]],
          }
        : (geometry as CreateAreaBody["geometry"]),
  };

  return pipe(
    AreaRepository.findOne<ServerContext>({
      where: { slug: Equal(slug) },
      loadRelationIds: true,
    }),
    fp.RTE.chain((area) => {
      if (fp.O.isSome(area)) {
        return fp.RTE.right([area.value]);
      }
      return AreaRepository.save([areaBody]);
    }),
    fp.RTE.map(([a]) => a),
    fp.RTE.chainEitherK((a) => AreaIO.decodeSingle(a)),
    LoggerService.RTE.debug("Created area %O"),
    fp.RTE.map((area) => ({
      content: [
        {
          text: formatAreaToMarkdown(area),
          type: "text" as const,
        },
      ],
    })),
  );
};
