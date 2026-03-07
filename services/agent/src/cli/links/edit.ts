import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { EditLinkInputSchema } from "@liexp/shared/lib/mcp/schemas/links.schemas.js";
import { throwTE } from "@liexp/shared/lib/utils/fp.utils.js";
import { Schema } from "effect";
import { getArg } from "../args.js";
import { type CommandModule } from "../command.type.js";

const splitUUIDs = (value: string | undefined): string[] =>
  value
    ? value
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

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
  run: async (ctx, args) => {
    const result = await pipe(
      Schema.decodeUnknownEither(EditLinkInputSchema)({
        id: getArg(args, "id"),
        title: getArg(args, "title"),
        description: getArg(args, "description"),
        url: getArg(args, "url"),
        status: getArg(args, "status"),
        publishDate: getArg(args, "publishDate"),
        events: getArg(args, "events"),
        keywords: getArg(args, "keywords"),
      }),
      fp.E.mapLeft((e) => new Error(`Invalid arguments: ${JSON.stringify(e)}`)),
      fp.TE.fromEither,
      fp.TE.chainW((input) => {
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
            events: splitUUIDs(input.events) as any[],
            keywords: splitUUIDs(input.keywords) as any[],
            provider: undefined,
            image: undefined,
            creator: null,
            overrideThumbnail: null,
          } as any,
        });
      }),
      fp.TE.tap((result) =>
        fp.TE.fromIO(() => {
          ctx.logger.debug.log("link edit response: id=%s", result.data.id);
        }),
      ),
      throwTE,
    );

    // eslint-disable-next-line no-console
    console.log(JSON.stringify(result, null, 2));
  },
};
