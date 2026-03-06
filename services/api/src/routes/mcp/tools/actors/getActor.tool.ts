import { ActorIO } from "@liexp/backend/lib/io/Actor.io.js";
import { ActorRepository } from "@liexp/backend/lib/services/entity-repository.service.js";
import { LoggerService } from "@liexp/backend/lib/services/logger/logger.service.js";
import { fp } from "@liexp/core/lib/fp/index.js";
import { GetActorInputSchema } from "@liexp/shared/lib/mcp/schemas/actors.schemas.js";
import { type CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { type ReaderTaskEither } from "fp-ts/lib/ReaderTaskEither.js";
import { pipe } from "fp-ts/lib/function.js";
import { Equal } from "typeorm";
import { type ServerContext } from "../../../../context/context.type.js";
import { formatActorToMarkdown } from "../formatters/actorToMarkdown.formatter.js";

export { GetActorInputSchema };

export const getActorToolTask = ({
  id,
}: GetActorInputSchema): ReaderTaskEither<
  ServerContext,
  Error,
  CallToolResult
> => {
  return pipe(
    ActorRepository.findOneOrFail<ServerContext>({
      where: { id: Equal(id) },
    }),
    LoggerService.RTE.debug("Results %O"),
    fp.RTE.chainEitherK((actor) => ActorIO.decodeSingle(actor)),
    fp.RTE.map((actor) => {
      return {
        content: [
          {
            text: formatActorToMarkdown(actor),
            type: "text" as const,
            href: `actor://${actor.id}`,
          },
        ],
      };
    }),
  );
};
