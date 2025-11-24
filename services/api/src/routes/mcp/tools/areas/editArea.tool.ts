import { editArea } from "@liexp/backend/lib/flows/areas/editArea.flow.js";
import { LoggerService } from "@liexp/backend/lib/services/logger/logger.service.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { UUID } from "@liexp/shared/lib/io/http/Common/UUID.js";
import { toInitialValue } from "@liexp/shared/lib/providers/blocknote/utils.js";
import { type CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { Schema } from "effect";
import * as O from "effect/Option";
import { type ReaderTaskEither } from "fp-ts/lib/ReaderTaskEither.js";
import { type ServerContext } from "../../../../context/context.type.js";
import { toControllerError } from "../../../../io/ControllerError.js";
import { formatAreaToMarkdown } from "../formatters/areaToMarkdown.formatter.js";

export const EditAreaInputSchema = Schema.Struct({
  id: UUID.annotations({
    description: "UUID of the area to edit",
  }),
  label: Schema.UndefinedOr(Schema.String).annotations({
    description: "Name/label of the area or undefined to keep current",
  }),
  body: Schema.UndefinedOr(Schema.String).annotations({
    description: "Description as plain text or undefined to keep current",
  }),
  draft: Schema.UndefinedOr(Schema.Boolean).annotations({
    description:
      "Whether the area is in draft mode or undefined to keep current",
  }),
  featuredImage: Schema.UndefinedOr(UUID).annotations({
    description: "Featured image media UUID or undefined to keep current",
  }),
  media: Schema.Array(UUID).annotations({
    description: "Array of media UUIDs associated with the area",
  }),
  events: Schema.Array(UUID).annotations({
    description: "Array of event UUIDs associated with the area",
  }),
  updateGeometry: Schema.UndefinedOr(Schema.Boolean).annotations({
    description: "Whether to fetch new coordinates based on the label",
  }),
});
export type EditAreaInputSchema = typeof EditAreaInputSchema.Type;

export const editAreaToolTask = ({
  id,
  label,
  body,
  draft,
  featuredImage,
  media,
  events,
  updateGeometry,
}: EditAreaInputSchema): ReaderTaskEither<
  ServerContext,
  Error,
  CallToolResult
> => {
  return pipe(
    editArea<ServerContext>({
      id,
      label: O.fromNullable(label),
      slug: O.fromNullable(label),
      body: pipe(
        O.fromNullable(body),
        O.map((b) => toInitialValue(b)),
      ),
      draft: O.fromNullable(draft),
      featuredImage: O.fromNullable(featuredImage),
      media,
      events: O.fromNullable(events),
      geometry: O.none(),
      updateGeometry: O.fromNullable(updateGeometry),
    }),
    fp.RTE.mapLeft(toControllerError),
    LoggerService.RTE.debug("Updated area %O"),
    fp.RTE.map((area) => ({
      content: [
        {
          text: formatAreaToMarkdown(area),
          type: "text" as const,
          href: `area://${area.id}`,
        },
      ],
    })),
  );
};
