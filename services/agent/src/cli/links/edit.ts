import { EditLinkInputSchema } from "@liexp/shared/lib/mcp/schemas/links.schemas.js";
import { getArg } from "../args.js";
import { type CommandModule } from "../command.type.js";
import { runCommand } from "../run-command.js";

export const linkEdit: CommandModule = {
  help: `
Usage: agent link edit [options]

Edit an existing link by UUID.

Options:
  --id=<uuid>                  Link UUID (required)
  --title=<string>             Link title
  --description=<string>       Link description
  --url=<url>                  Link URL
  --status=<DRAFT|APPROVED|UNAPPROVED>  Link status
  --publishDate=<YYYY-MM-DD>   Publication date
  --events=<uuid,uuid,...>     Comma-separated event UUIDs to associate
  --keywords=<uuid,uuid,...>   Comma-separated keyword UUIDs
  --help                       Show this help message

Output: JSON updated link object
`,
  run: (ctx, args) =>
    runCommand(
      ctx,
      EditLinkInputSchema,
      {
        id: getArg(args, "id"),
        title: getArg(args, "title"),
        description: getArg(args, "description"),
        url: getArg(args, "url"),
        status: getArg(args, "status"),
        publishDate: getArg(args, "publishDate"),
        events: getArg(args, "events"),
        keywords: getArg(args, "keywords"),
      },
      (input) => {
        ctx.logger.debug.log("link edit input: %O", input);
        return ctx.api.Link.Edit({
          Params: { id: input.id as any },
          Body: {
            title: input.title ?? "",
            description: input.description ?? "",
            url: input.url as any,
            status: (input.status ?? "DRAFT") as any,
            publishDate: input.publishDate
              ? new Date(input.publishDate)
              : undefined,
            events: input.events,
            keywords: input.keywords,
            provider: undefined,
            image: undefined,
            creator: null,
            overrideThumbnail: null,
          } as any,
        });
      },
    ),
};
