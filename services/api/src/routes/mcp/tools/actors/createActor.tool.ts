import { LoggerService } from "@liexp/backend/lib/services/logger/logger.service.js";
import { fp } from "@liexp/core/lib/fp/index.js";
import { AddActorBody } from "@liexp/io/lib/http/Actor.js";
import { CreateActorInputSchema } from "@liexp/shared/lib/mcp/schemas/actors.schemas.js";
import {
  toParagraph,
  toInitialValue,
} from "@liexp/shared/lib/providers/blocknote/utils.js";
import { generateRandomColor } from "@liexp/shared/lib/utils/colors.js";
import { type CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { Schema } from "effect";
import * as O from "effect/Option";
import { type ReaderTaskEither } from "fp-ts/lib/ReaderTaskEither.js";
import { pipe } from "fp-ts/lib/function.js";
import { type ServerContext } from "../../../../context/context.type.js";
import { createActor } from "../../../../flows/actors/createActor.flow.js";
import { toControllerError } from "../../../../io/ControllerError.js";
import { formatActorToMarkdown } from "../formatters/actorToMarkdown.formatter.js";

export { CreateActorInputSchema };

export const createActorToolTask = ({
  username,
  fullName,
  config,
}: CreateActorInputSchema): ReaderTaskEither<
  ServerContext,
  Error,
  CallToolResult
> => {
  // Extract config values with sensible defaults
  const safeConfig = config ?? {};
  const getColor = (): string => {
    if (safeConfig?.color) return safeConfig.color;
    return generateRandomColor();
  };

  // Helper to ensure we have a valid BlockNoteDocument
  const getExcerpt = () => {
    if (safeConfig?.excerpt) return toInitialValue(safeConfig.excerpt);
    // Return an empty paragraph as default
    return [toParagraph("")];
  };

  const actorBody = {
    username,
    fullName,
    color: getColor(),
    excerpt: getExcerpt(),
    body: safeConfig?.body ? toInitialValue(safeConfig.body) : undefined,
    nationalities: safeConfig?.nationalityIds ?? [],
    avatar: safeConfig?.avatar ?? undefined,
    bornOn: safeConfig?.bornOn ?? undefined,
    diedOn: pipe(
      O.fromNullable(safeConfig?.diedOn),
      O.filter((date) => date !== ""),
      O.getOrUndefined,
    ),
  };

  return pipe(
    Schema.decodeUnknownEither(AddActorBody)(actorBody),
    fp.E.mapLeft(toControllerError),
    fp.RTE.fromEither,
    fp.RTE.chain((body) => createActor(body)),
    LoggerService.RTE.debug("Created actor %O"),
    fp.RTE.map((actor) => {
      if ("success" in actor) {
        return {
          content: [
            {
              text: "Actor creation process initiated successfully.",
              type: "text" as const,
            },
          ],
        };
      }

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
