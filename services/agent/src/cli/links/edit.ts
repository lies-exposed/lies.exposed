import { EditLinkInputSchema } from "@liexp/shared/lib/mcp/schemas/links.schemas.js";
import { makeCommand } from "../run-command.js";

export const linkEdit = makeCommand(
  EditLinkInputSchema,
  {
    usage: "link edit",
    description: "Edit an existing link by UUID.",
    output: "JSON updated link object",
  },
  (input, ctx) => {
    ctx.logger.debug.log("link edit input: %O", input);
    const { id, ...restInput } = input;
    return ctx.api.Link.Edit({
      Params: { id },
      Body: {
        ...restInput,
        title: input.title,
        description: input.description ?? "",
        publishDate: input.publishDate?.toISOString(),
        status: input.status ?? "DRAFT",
        events: input.events ?? [],
        keywords: input.keywords ?? [],
      },
    });
  },
);
