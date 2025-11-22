import { LinkIO } from "@liexp/backend/lib/io/link.io.js";
import { LinkRepository } from "@liexp/backend/lib/services/entity-repository.service.js";
import { LoggerService } from "@liexp/backend/lib/services/logger/logger.service.js";
import { fp } from "@liexp/core/lib/fp/index.js";
import { UUID } from "@liexp/shared/lib/io/http/Common/UUID.js";
import { type CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { Schema } from "effect";
import { type ReaderTaskEither } from "fp-ts/lib/ReaderTaskEither.js";
import { pipe } from "fp-ts/lib/function.js";
import { Equal } from "typeorm";
import { type ServerContext } from "../../../../context/context.type.js";
import { formatLinkToMarkdown } from "../formatters/linkToMarkdown.formatter.js";

export const GetLinkInputSchema = Schema.Struct({
  id: UUID.annotations({
    description: "UUID of the link to retrieve",
  }),
});
export type GetLinkInputSchema = typeof GetLinkInputSchema.Type;

export const getLinkToolTask = ({
  id,
}: GetLinkInputSchema): ReaderTaskEither<
  ServerContext,
  Error,
  CallToolResult
> => {
  return pipe(
    LinkRepository.findOneOrFail<ServerContext>({ where: { id: Equal(id) } }),
    fp.RTE.chainEitherK(LinkIO.decodeSingle),
    LoggerService.RTE.debug(`Results %O`),
    fp.RTE.map((link) => {
      return {
        content: [
          {
            text: formatLinkToMarkdown(link),
            type: "text" as const,
            href: `link://${link.id}`,
          },
        ],
      };
    }),
  );
};
