import { EventV2IO } from "@liexp/backend/lib/io/event/eventV2.io.js";
import { EventRepository } from "@liexp/backend/lib/services/entity-repository.service.js";
import { LoggerService } from "@liexp/backend/lib/services/logger/logger.service.js";
import { fp } from "@liexp/core/lib/fp/index.js";
import { UUID } from "@liexp/shared/lib/io/http/Common/UUID.js";
import { Schema } from "effect";
import { pipe } from "fp-ts/lib/function.js";
import { Equal } from "typeorm";
import { type ServerContext } from "../../../../context/context.type.js";
import { formatEventToMarkdown } from "../formatters/eventToMarkdown.formatter.js";

export const GetEventInputSchema = Schema.Struct({
  id: UUID.annotations({
    description: "ID of the event to retrieve",
  }),
});
export type GetEventInputSchema = typeof GetEventInputSchema.Type;

export const getEventToolTask = ({ id }: GetEventInputSchema) => {
  return pipe(
    EventRepository.findOneOrFail<ServerContext>({
      where: { id: Equal(id) },
      loadRelationIds: {
        relations: ["media", "links", "keywords"],
      },
    }),
    LoggerService.RTE.debug(`Result %O`),
    fp.RTE.chainEitherK((result) => EventV2IO.decodeSingle(result)),
    fp.RTE.map((event) => {
      return {
        content: [
          {
            text: formatEventToMarkdown(event),
            uri: `event://${event.id}`,
            type: "text" as const,
          },
        ],
      };
    }),
  );
};
