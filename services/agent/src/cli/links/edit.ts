import { EditLinkInputSchema } from "@liexp/shared/lib/mcp/schemas/links.schemas.js";
import { removeUndefinedFromPayload } from "@liexp/shared/lib/utils/fp.utils.js";
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
    return ctx.api.Link.Edit({
      Params: { id: input.id },
      Body: {
        ...removeUndefinedFromPayload({
          title: input.title,
          description: input.description,
          url: input.url,
          status: input.status,
          publishDate: input.publishDate,
          events: input.events as any[] | undefined,
          keywords: input.keywords as any[] | undefined,
        }),
        provider: undefined,
        image: undefined,
        creator: null,
        overrideThumbnail: null,
      } as any,
    });
  },
);
