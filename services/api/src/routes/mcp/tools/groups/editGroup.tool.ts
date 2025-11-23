import { fp } from "@liexp/core/lib/fp/index.js";
import { UUID } from "@liexp/shared/lib/io/http/Common/UUID.js";
import { toInitialValue } from "@liexp/shared/lib/providers/blocknote/utils.js";
import { type CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { Schema } from "effect";
import * as O from "effect/Option";
import { type ReaderTaskEither } from "fp-ts/lib/ReaderTaskEither.js";
import { pipe } from "fp-ts/lib/function.js";
import { type ServerContext } from "../../../../context/context.type.js";
import { editGroup } from "../../../../flows/groups/editGroup.flow.js";
import { formatGroupToMarkdown } from "../formatters/groupToMarkdown.formatter.js";

export const EditInputSchema = Schema.Struct({
  id: UUID.annotations({
    description: "UUID of the group to edit",
  }),
  name: Schema.UndefinedOr(Schema.String).annotations({
    description: "Name of the group or null to keep current",
  }),
  username: Schema.UndefinedOr(Schema.String).annotations({
    description: "Unique username for the group or null to keep current",
  }),
  color: Schema.UndefinedOr(Schema.String).annotations({
    description:
      "Color associated with the group (hex format, without #) or null to keep current",
  }),
  kind: Schema.UndefinedOr(
    Schema.Union(Schema.Literal("Public"), Schema.Literal("Private")),
  ).annotations({
    description:
      "Whether the group is Public or Private or null to keep current",
  }),
  excerpt: Schema.UndefinedOr(Schema.String).annotations({
    description:
      "Short description of the group as plain text or null to keep current",
  }),
  body: Schema.UndefinedOr(Schema.String).annotations({
    description: "Full body content as plain text or null to keep current",
  }),
  avatar: Schema.UndefinedOr(UUID).annotations({
    description: "Avatar media UUID or null to keep current",
  }),
  startDate: Schema.UndefinedOr(Schema.String).annotations({
    description:
      "Group start date in ISO format (YYYY-MM-DD) or null to keep current",
  }),
  endDate: Schema.UndefinedOr(Schema.String).annotations({
    description:
      "Group end date in ISO format (YYYY-MM-DD) or null to keep current",
  }),
  members: Schema.UndefinedOr(Schema.Array(UUID)).annotations({
    description: "Array of group members or null to keep current",
  }),
});

export type EditInputSchema = typeof EditInputSchema.Type;

export const editGroupToolTask = ({
  id,
  name,
  username,
  color,
  kind,
  excerpt,
  body,
  avatar,
  startDate,
  endDate,
  members,
}: EditInputSchema): ReaderTaskEither<ServerContext, Error, CallToolResult> => {
  return pipe(
    editGroup({
      id,
      name: O.fromNullable(name),
      username: O.fromNullable(username),
      color: O.fromNullable(color),
      kind: O.fromNullable(kind),
      excerpt: pipe(
        O.fromNullable(excerpt),
        O.map((e) => toInitialValue(e)),
      ),
      body: pipe(
        O.fromNullable(body),
        O.map((b) => toInitialValue(b)),
      ),
      avatar: O.fromNullable(avatar),
      startDate: O.fromNullable(startDate),
      endDate: O.fromNullable(endDate),
      members: pipe(
        O.fromNullable(members),
        O.filter((m) => m.length > 0),
      ),
    }),
    fp.RTE.map((group) => ({
      content: [
        {
          text: formatGroupToMarkdown(group),
          type: "text" as const,
          href: `group://${group.id}`,
        },
      ],
    })),
  );
};
