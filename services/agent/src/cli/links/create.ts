import { CreateLinkInputSchema } from "@liexp/shared/lib/mcp/schemas/links.schemas.js";
import { type CommandModule } from "../command.type.js";
import { runCliCommand } from "../run-command.js";

export const linkCreate: CommandModule = {
  help: `
Usage: agent link create [options]

Create a new link by submitting its URL (metadata is auto-fetched via OpenGraph).

Options:
  --url=<string>   URL of the link (required)
  --help           Show this help message

Output: JSON created link object
`,
  run: (ctx, args) =>
    runCliCommand(ctx, CreateLinkInputSchema, args, (input) => {
      ctx.logger.debug.log("link create input: %O", input);
      return ctx.api.Link.Custom.Submit({
        Body: { url: input.url as any },
      });
    }),
};
