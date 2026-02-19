import { LoggerService } from "@liexp/backend/lib/services/logger/logger.service.js";
import { fp } from "@liexp/core/lib/fp/index.js";
import { AddActorBody } from "@liexp/io/lib/http/Actor.js";
import { UUID } from "@liexp/io/lib/http/Common/UUID.js";
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

/**
 * Simplified actor creation schema.
 * Only 2 required fields: username and fullName.
 * Optional fields grouped into config object for clarity.
 */
export const CreateActorInputSchema = Schema.Struct({
  username: Schema.String.annotations({
    description: "Unique username for the actor (required)",
  }),
  fullName: Schema.String.annotations({
    description: "Full name of the actor (required)",
  }),
  config: Schema.optional(
    Schema.Struct({
      color: Schema.optional(Schema.String).annotations({
        description: "Hex color without # (default: random)",
      }),
      excerpt: Schema.optional(Schema.String).annotations({
        description: "Short description (default: null)",
      }),
      nationalityIds: Schema.optional(Schema.Array(UUID)).annotations({
        description: "Array of nationality UUIDs (default: [])",
      }),
      body: Schema.optional(Schema.String).annotations({
        description: "Full body content as plain text (default: null)",
      }),
      avatar: Schema.optional(UUID).annotations({
        description: "Avatar media UUID (default: null)",
      }),
      bornOn: Schema.optional(Schema.String).annotations({
        description: "Birth date in ISO format YYYY-MM-DD (default: null)",
      }),
      diedOn: Schema.optional(Schema.String).annotations({
        description: "Death date in ISO format YYYY-MM-DD (default: null)",
      }),
    }),
  ).annotations({
    description:
      "Optional configuration. Fields not specified use defaults (random color, empty arrays, null values)",
  }),
});
export type CreateActorInputSchema = typeof CreateActorInputSchema.Type;

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
