import { fp } from "@liexp/core/lib/fp/index.js";
import { UUID } from "@liexp/shared/lib/io/http/Common/UUID.js";
import type { AddGroupBody } from "@liexp/shared/lib/io/http/Group.js";
import { toInitialValue } from "@liexp/shared/lib/providers/blocknote/utils.js";
import { type CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { Schema } from "effect";
import { type ReaderTaskEither } from "fp-ts/lib/ReaderTaskEither.js";
import { pipe } from "fp-ts/lib/function.js";
import { type ServerContext } from "../../../../context/context.type.js";
import { createGroupFromBody } from "../../../../flows/groups/createGroup.flow.js";
import { formatGroupToMarkdown } from "../formatters/groupToMarkdown.formatter.js";

export const CreateInputSchema = Schema.Struct({
  name: Schema.String.annotations({
    description: "Name of the group",
  }),
  username: Schema.String.annotations({
    description: "Unique username for the group",
  }),
  color: Schema.String.annotations({
    description: "Color associated with the group (hex format, without #)",
  }),
  kind: Schema.Union(
    Schema.Literal("Public"),
    Schema.Literal("Private"),
  ).annotations({
    description: "Whether the group is Public or Private",
  }),
  excerpt: Schema.String.annotations({
    description: "Short description of the group as plain text or null",
  }),
  body: Schema.UndefinedOr(Schema.String).annotations({
    description: "Full body content as plain text or null",
  }),
  avatar: Schema.UndefinedOr(UUID).annotations({
    description: "Avatar media UUID or null",
  }),
  startDate: Schema.UndefinedOr(Schema.String).annotations({
    description: "Group start date in ISO format (YYYY-MM-DD) or null",
  }),
  endDate: Schema.UndefinedOr(Schema.String).annotations({
    description: "Group end date in ISO format (YYYY-MM-DD) or null",
  }),
});

export type CreateInputSchema = typeof CreateInputSchema.Type;

export const createGroupToolTask = ({
  name,
  username,
  color,
  kind,
  excerpt,
  body,
  avatar,
  startDate,
  endDate,
  // members,
}: CreateInputSchema): ReaderTaskEither<
  ServerContext,
  Error,
  CallToolResult
> => {
  const groupBody: AddGroupBody = {
    name,
    username,
    color,
    kind,
    excerpt: excerpt ? toInitialValue(excerpt) : undefined,
    body: body ? toInitialValue(body) : undefined,
    avatar: avatar ?? undefined,
    startDate: startDate ? new Date(startDate) : undefined,
    endDate: endDate ? new Date(endDate) : undefined,
    members: [],
  };

  return pipe(
    createGroupFromBody(groupBody),
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
