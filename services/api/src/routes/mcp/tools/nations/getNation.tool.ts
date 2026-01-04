import { NationIO } from "@liexp/backend/lib/io/Nation.io.js";
import { NationRepository } from "@liexp/backend/lib/services/entity-repository.service.js";
import { LoggerService } from "@liexp/backend/lib/services/logger/logger.service.js";
import { fp } from "@liexp/core/lib/fp/index.js";
import { UUID } from "@liexp/shared/lib/io/http/Common/UUID.js";
import { type CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { Schema } from "effect";
import { type ReaderTaskEither } from "fp-ts/lib/ReaderTaskEither.js";
import { pipe } from "fp-ts/lib/function.js";
import { Equal } from "typeorm";
import { type ServerContext } from "../../../../context/context.type.js";
import { formatNationToMarkdown } from "../formatters/nationToMarkdown.formatter.js";

export const GetNationInputSchema = Schema.Struct({
  id: UUID.annotations({
    description: "The UUID of the nation to retrieve",
  }),
});
export type GetNationInputSchema = typeof GetNationInputSchema.Type;

export const getNationToolTask = ({
  id,
}: GetNationInputSchema): ReaderTaskEither<
  ServerContext,
  Error,
  CallToolResult
> => {
  return pipe(
    NationRepository.findOneOrFail<ServerContext>({
      where: { id: Equal(id) },
    }),
    LoggerService.RTE.debug("Results %O"),
    fp.RTE.chainEitherK((nation) => NationIO.decodeSingle(nation)),
    fp.RTE.map((nation) => {
      return {
        content: [
          {
            text: formatNationToMarkdown(nation),
            type: "text" as const,
            href: `nation://${nation.id}`,
          },
        ],
      };
    }),
  );
};
