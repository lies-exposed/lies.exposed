import { LoggerService } from "@liexp/backend/lib/services/logger/logger.service.js";
import { fp } from "@liexp/core/lib/fp/index.js";
import { EditActorInputSchema } from "@liexp/shared/lib/mcp/schemas/actors.schemas.js";
import { toInitialValue } from "@liexp/shared/lib/providers/blocknote/utils.js";
import { type CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import * as O from "effect/Option";
import { type ReaderTaskEither } from "fp-ts/lib/ReaderTaskEither.js";
import { pipe } from "fp-ts/lib/function.js";
import { type ServerContext } from "../../../../context/context.type.js";
import { editActor } from "../../../../flows/actors/editActor.flow.js";
import { formatActorToMarkdown } from "../formatters/actorToMarkdown.formatter.js";

export { EditActorInputSchema };

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
        O.filter((n) => n !== undefined),
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
        O.filter((members) => members !== undefined && members.length > 0),
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
