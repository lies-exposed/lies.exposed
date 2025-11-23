import { fp } from "@liexp/core/lib/fp/index.js";
import { LoggerService } from "@liexp/backend/lib/services/logger/logger.service.js";
import { AddActorBody } from "@liexp/shared/lib/io/http/Actor.js";
import { UUID } from "@liexp/shared/lib/io/http/Common/UUID.js";
import { toInitialValue } from "@liexp/shared/lib/providers/blocknote/utils.js";
import { type CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { Schema } from "effect";
import * as O from "effect/Option";
import { type ReaderTaskEither } from "fp-ts/lib/ReaderTaskEither.js";
import { pipe } from "fp-ts/lib/function.js";
import { type ServerContext } from "../../../../context/context.type.js";
import { createActor } from "../../../../flows/actors/createActor.flow.js";
import { toControllerError } from "../../../../io/ControllerError.js";
import { formatActorToMarkdown } from "../formatters/actorToMarkdown.formatter.js";

export const CreateActorInputSchema = Schema.Struct({
  username: Schema.String.annotations({
    description: "Unique username for the actor",
  }),
  fullName: Schema.String.annotations({
    description: "Full name of the actor",
  }),
  color: Schema.String.annotations({
    description: "Color associated with the actor (hex format, without #)",
  }),
  excerpt: Schema.UndefinedOr(Schema.String).annotations({
    description: "Short description of the actor as plain text or null",
  }),
  nationalities: Schema.Array(UUID).annotations({
    description: "Array of nationality UUIDs",
  }),
  body: Schema.UndefinedOr(Schema.String).annotations({
    description: "Full body content as plain text or null",
  }),
  avatar: UUID.annotations({
    description: "Avatar media UUID or null",
  }),
  bornOn: Schema.UndefinedOr(Schema.String).annotations({
    description: "Birth date in ISO format (YYYY-MM-DD) or undefined",
  }),
  diedOn: Schema.UndefinedOr(Schema.String).annotations({
    description: "Death date in ISO format (YYYY-MM-DD) or undefined",
  }),
});
export type CreateActorInputSchema = typeof CreateActorInputSchema.Type;

export const createActorToolTask = ({
  username,
  fullName,
  color,
  excerpt,
  nationalities,
  body,
  avatar,
  bornOn,
  diedOn,
}: CreateActorInputSchema): ReaderTaskEither<
  ServerContext,
  Error,
  CallToolResult
> => {
  const actorBody = {
    username,
    fullName,
    color,
    excerpt: excerpt ? toInitialValue(excerpt) : toInitialValue(""),
    nationalities: nationalities ?? [],
    body: body ? toInitialValue(body) : undefined,
    avatar: avatar ?? undefined,
    bornOn: bornOn ?? undefined,
    diedOn: pipe(
      O.fromNullable(diedOn),
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
