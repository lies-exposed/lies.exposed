import {
  CreateScientificStudyEventSchema,
  EditScientificStudyEventSchema,
} from "@liexp/shared/lib/mcp/schemas/events/scientific-study.schema.js";
import { removeUndefinedFromPayload } from "@liexp/shared/lib/utils/fp.utils.js";
import { makeCommand } from "../../run-command.js";
import { buildCreateCommon, buildEditCommon } from "./common.js";

export const scientificStudyCreate = makeCommand(
  CreateScientificStudyEventSchema,
  {
    usage: "event scientific-study create",
    description: "Create a ScientificStudy event.",
    output: "JSON created event object",
  },
  (input, ctx) =>
    ctx.api.Event.Create({
      Body: {
        ...buildCreateCommon(input),
        type: "ScientificStudy" as const,
        payload: {
          title: input.title,
          url: input.studyUrl,
          image: input.image,
          publisher: input.publisher,
          authors: [...(input.authors ?? [])],
        },
      } as any,
    }),
);

export const scientificStudyEdit = makeCommand(
  EditScientificStudyEventSchema,
  {
    usage: "event scientific-study edit",
    description: "Edit a ScientificStudy event by UUID.",
    output: "JSON updated event object",
  },
  (input, ctx) =>
    ctx.api.Event.Edit({
      Params: { id: input.id },
      Body: {
        ...buildEditCommon(input),
        type: "ScientificStudy" as const,
        payload: removeUndefinedFromPayload({
          title: input.title,
          url: input.studyUrl,
          image: input.image,
          publisher: input.publisher,
          authors: input.authors ? [...input.authors] : undefined,
        }),
      } as any,
    }),
);
