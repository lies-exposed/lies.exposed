import { GroupIO } from "@liexp/backend/lib/io/group.io.js";
import { GroupRepository } from "@liexp/backend/lib/services/entity-repository.service.js";
import { fp } from "@liexp/core/lib/fp/index.js";
import { UUID } from "@liexp/shared/lib/io/http/Common/UUID.js";
import { type CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { Schema } from "effect";
import { type ReaderTaskEither } from "fp-ts/lib/ReaderTaskEither.js";
import { pipe } from "fp-ts/lib/function.js";
import { Equal } from "typeorm";
import { type ServerContext } from "../../../../context/context.type.js";
import { formatGroupToMarkdown } from "../formatters/groupToMarkdown.formatter.js";

export const GetGroupInputSchema = Schema.Struct({
  id: UUID.annotations({
    description: "UUID of the group to retrieve",
  }),
});
type GetGroupInput = typeof GetGroupInputSchema.Type;

export const getGroupToolTask = ({
  id,
}: GetGroupInput): ReaderTaskEither<ServerContext, Error, CallToolResult> => {
  return pipe(
    GroupRepository.findOneOrFail({ where: { id: Equal(id) } }),
    fp.RTE.chainEitherK(GroupIO.decodeSingle),
    fp.RTE.map((group) => {
      return {
        content: [
          {
            text: formatGroupToMarkdown(group),
            type: "text" as const,
            href: `group://${group.id}`,
          },
        ],
      };
    }),
  );
};
