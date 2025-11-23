import { LoggerService } from "@liexp/backend/lib/services/logger/logger.service.js";
import { fp } from "@liexp/core/lib/fp/index.js";
import { UUID } from "@liexp/shared/lib/io/http/Common/UUID.js";
import { toInitialValue } from "@liexp/shared/lib/providers/blocknote/utils.js";
import { type CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { Schema } from "effect";
import * as O from "effect/Option";
import { type ReaderTaskEither } from "fp-ts/lib/ReaderTaskEither.js";
import { pipe } from "fp-ts/lib/function.js";
import { type ServerContext } from "../../../../context/context.type.js";
import { editActor } from "../../../../flows/actors/editActor.flow.js";
import { formatActorToMarkdown } from "../formatters/actorToMarkdown.formatter.js";

export const EditActorInputSchema = Schema.Struct({
  id: UUID.annotations({
    description: "UUID of the actor to edit",
  }),
  username: Schema.UndefinedOr(Schema.String).annotations({
    description: "Unique username for the actor or null to keep current",
  }),
  fullName: Schema.UndefinedOr(Schema.String).annotations({
    description: "Full name of the actor or null to keep current",
  }),
  color: Schema.UndefinedOr(Schema.String).annotations({
    description:
      "Color associated with the actor (hex format, without #) or null to keep current",
  }),
  excerpt: Schema.UndefinedOr(Schema.String).annotations({
    description:
      "Short description of the actor as plain text or null to keep current",
  }),
  nationalities: Schema.Array(UUID).annotations({
    description: "Array of nationality UUIDs or null to keep current",
  }),
  body: Schema.UndefinedOr(Schema.String).annotations({
    description: "Full body content as plain text or null to keep current",
  }),
  avatar: Schema.UndefinedOr(UUID).annotations({
    description: "Avatar media UUID or null to keep current",
  }),
  bornOn: Schema.UndefinedOr(Schema.String).annotations({
    description:
      "Birth date in ISO format (YYYY-MM-DD) or null to keep current",
  }),
  diedOn: Schema.UndefinedOr(Schema.String).annotations({
    description:
      "Death date in ISO format (YYYY-MM-DD) or undefined to keep current",
  }),
  memberIn: Schema.Array(Schema.Union(UUID)).annotations({
    description:
      "Array of group memberships (as UUIDs or detailed objects) or null to keep current",
  }),
});
export type EditActorInputSchema = typeof EditActorInputSchema.Type;

export const editActorToolTask = ({
  id,
  username,
  fullName,
  color,
  excerpt,
  nationalities,
  body,
  avatar,
  bornOn,
  diedOn,
  memberIn,
}: EditActorInputSchema): ReaderTaskEither<
  ServerContext,
  Error,
  CallToolResult
> => {
  return pipe(
    editActor({
      id,
      username: O.fromNullable(username),
      fullName: O.fromNullable(fullName),
      color: O.fromNullable(color),
      excerpt: pipe(
        O.fromNullable(excerpt),
        O.map((e) => toInitialValue(e)),
      ),
      nationalities: pipe(
        O.fromNullable(nationalities),
        O.map((n) => [...n]),
      ),
      body: pipe(
        O.fromNullable(body),
        O.map((b) => toInitialValue(b)),
      ),
      avatar: O.fromNullable(avatar),
      bornOn: O.fromNullable(bornOn),
      diedOn: O.fromNullable(diedOn),
      memberIn: pipe(
        O.fromNullable(memberIn),
        O.filter((members) => members.length > 0),
      ),
    }),
    LoggerService.RTE.debug("Updated actor %O"),
    fp.RTE.map((actor) => ({
      content: [
        {
          text: formatActorToMarkdown(actor),
          type: "text" as const,
          href: `actor://${actor.id}`,
        },
      ],
    })),
  );
};
