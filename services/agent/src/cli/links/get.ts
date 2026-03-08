import { GetLinkInputSchema } from "@liexp/shared/lib/mcp/schemas/links.schemas.js";
import { type CommandModule } from "../command.type.js";
import { runCliCommand } from "../run-command.js";

export const linkGet: CommandModule = {
  help: `
Usage: agent link get [options]

Retrieve a link by UUID.

Options:
  --id=<uuid>   Link UUID (required)
  --help        Show this help message

Output: JSON link object
`,
  run: (ctx, args) =>
    runCliCommand(ctx, GetLinkInputSchema, args, (input) => {
      ctx.logger.debug.log("link get input: %O", input);
      return ctx.api.Link.Get({ Params: { id: input.id as any } });
    }),
};
