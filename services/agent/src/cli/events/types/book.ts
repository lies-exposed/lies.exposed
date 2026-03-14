import {
  CreateBookEventSchema,
  EditBookEventSchema,
} from "@liexp/shared/lib/mcp/schemas/events/book.schema.js";
import { makeCommand } from "../../run-command.js";
import { buildCreateCommon, buildEditCommon } from "./common.js";

export const bookCreate = makeCommand(
  CreateBookEventSchema,
  {
    usage: "event book create",
    description: "Create a Book event.",
    output: "JSON created event object",
  },
  (input, ctx) =>
    ctx.api.Event.Create({
      Body: {
        ...buildCreateCommon(input),
        type: "Book" as const,
        payload: {
          title: input.title,
          media: { pdf: input.pdf, audio: input.audio },
          authors: (input.authors ?? []).map((id) => ({
            type: "Actor" as const,
            id,
          })),
          publisher: input.publisher
            ? { type: "Actor" as const, id: input.publisher }
            : undefined,
        },
      },
    }),
);

export const bookEdit = makeCommand(
  EditBookEventSchema,
  {
    usage: "event book edit",
    description: "Edit a Book event by UUID.",
    output: "JSON updated event object",
  },
  (input, ctx) =>
    ctx.api.Event.Edit({
      Params: { id: input.id },
      Body: {
        ...buildEditCommon(input),
        type: "Book" as const,
        payload: {
          title: input.title!,
          media: {
            pdf: input.pdf!,
            audio: input.audio ?? undefined,
          },
          authors: (input.authors ?? []).map((id) => ({
            type: "Actor" as const,
            id,
          })),
          publisher: input.publisher
            ? { type: "Actor" as const, id: input.publisher }
            : undefined,
        },
      },
    }),
);
