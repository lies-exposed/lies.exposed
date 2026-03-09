import {
  CreateDocumentaryEventSchema,
  EditDocumentaryEventSchema,
} from "@liexp/shared/lib/mcp/schemas/events/documentary.schema.js";
import { removeUndefinedFromPayload } from "@liexp/shared/lib/utils/fp.utils.js";
import { makeCommand } from "../../run-command.js";
import { buildCreateCommon, buildEditCommon } from "./common.js";

export const documentaryCreate = makeCommand(
  CreateDocumentaryEventSchema,
  {
    usage: "event documentary create",
    description: "Create a Documentary event.",
    output: "JSON created event object",
  },
  (input, ctx) =>
    ctx.api.Event.Create({
      Body: {
        ...buildCreateCommon(input),
        type: "Documentary" as const,
        payload: {
          title: input.title,
          media: input.documentaryMedia,
          website: input.website ?? null,
          authors: {
            actors: (input.authorActors ?? []) as any[],
            groups: (input.authorGroups ?? []) as any[],
          },
          subjects: {
            actors: (input.subjectActors ?? []) as any[],
            groups: (input.subjectGroups ?? []) as any[],
          },
        },
      } as any,
    }),
);

export const documentaryEdit = makeCommand(
  EditDocumentaryEventSchema,
  {
    usage: "event documentary edit",
    description: "Edit a Documentary event by UUID.",
    output: "JSON updated event object",
  },
  (input, ctx) =>
    ctx.api.Event.Edit({
      Params: { id: input.id },
      Body: {
        ...buildEditCommon(input),
        type: "Documentary" as const,
        payload: removeUndefinedFromPayload({
          title: input.title,
          media: input.documentaryMedia,
          website: input.website ?? null,
          authors:
            input.authorActors !== undefined || input.authorGroups !== undefined
              ? {
                  actors: (input.authorActors ?? []) as any[],
                  groups: (input.authorGroups ?? []) as any[],
                }
              : undefined,
          subjects:
            input.subjectActors !== undefined ||
            input.subjectGroups !== undefined
              ? {
                  actors: (input.subjectActors ?? []) as any[],
                  groups: (input.subjectGroups ?? []) as any[],
                }
              : undefined,
        }),
      } as any,
    }),
);
