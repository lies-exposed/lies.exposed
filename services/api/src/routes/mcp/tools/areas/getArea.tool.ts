import { AreaIO } from "@liexp/backend/lib/io/Area.io.js";
import { AreaRepository } from "@liexp/backend/lib/services/entity-repository.service.js";
import { LoggerService } from "@liexp/backend/lib/services/logger/logger.service.js";
import { fp } from "@liexp/core/lib/fp/index.js";
import { UUID } from "@liexp/shared/lib/io/http/Common/UUID.js";
import { type CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { Schema } from "effect";
import { type ReaderTaskEither } from "fp-ts/lib/ReaderTaskEither.js";
import { pipe } from "fp-ts/lib/function.js";
import { Equal } from "typeorm";
import { type ServerContext } from "../../../../context/context.type.js";
import { formatAreaToMarkdown } from "../formatters/areaToMarkdown.formatter.js";

export const GetAreaInputSchema = Schema.Struct({
  id: UUID.annotations({
    description: "UUID of the area to retrieve",
  }),
});
export type GetAreaInputSchema = typeof GetAreaInputSchema.Type;

export const getAreaToolTask = ({
  id,
}: GetAreaInputSchema): ReaderTaskEither<
  ServerContext,
  Error,
  CallToolResult
> => {
  return pipe(
    AreaRepository.findOneOrFail<ServerContext>({
      where: { id: Equal(id) },
    }),
    LoggerService.RTE.debug("Results %O"),
    fp.RTE.chainEitherK((area) => AreaIO.decodeSingle(area)),
    fp.RTE.map((area) => {
      return {
        content: [
          {
            text: formatAreaToMarkdown(area),
            type: "text" as const,
            href: `area://${area.id}`,
          },
        ],
      };
    }),
  );
};
