import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { FindActorsInputSchema } from "@liexp/shared/lib/mcp/schemas/actors.schemas.js";
import { throwTE } from "@liexp/shared/lib/utils/fp.utils.js";
import { Schema } from "effect";
import { type CommandModule } from "../command.type.js";

const getArg = (args: string[], key: string): string | undefined =>
  args
    .find((a) => a.startsWith(`--${key}=`))
    ?.split("=")
    .slice(1)
    .join("=");

export const actorFind: CommandModule = {
  help: `
Usage: agent actor-find [options]

Search for actors by name or group membership.

Options:
  --fullName=<string>   Filter by full name (partial match)
  --memberIn=<uuid>     Filter by group membership (group UUID)
  --start=<number>      Pagination start index (default: 0)
  --end=<number>        Pagination end index (default: 20)
  --sort=<field>        Sort field: username | createdAt | updatedAt
  --order=<ASC|DESC>    Sort order
  --withDeleted         Include deleted actors
  --help                Show this help message

Output: JSON array of actor objects
`,
  run: async (ctx, args) => {
    const memberInArg = getArg(args, "memberIn");
    const startArg = getArg(args, "start");
    const endArg = getArg(args, "end");

    const result = await pipe(
      Schema.decodeUnknownEither(FindActorsInputSchema)({
        fullName: getArg(args, "fullName"),
        memberIn: memberInArg ? [memberInArg] : [],
        withDeleted: args.includes("--withDeleted") ? true : undefined,
        sort: getArg(args, "sort"),
        order: getArg(args, "order"),
        start: startArg !== undefined ? Number(startArg) : undefined,
        end: endArg !== undefined ? Number(endArg) : undefined,
      }),
      fp.E.mapLeft((e) => new Error(`Invalid arguments: ${JSON.stringify(e)}`)),
      fp.TE.fromEither,
      fp.TE.chainW((input) => {
        ctx.logger.debug.log("actor-find input: %O", input);
        return ctx.api.Actor.List({
          Query: {
            q: input.fullName,
            memberIn:
              input.memberIn.length > 0 ? (input.memberIn as any) : undefined,
            _start: input.start !== undefined ? String(input.start) : "0",
            _end: input.end !== undefined ? String(input.end) : "20",
          },
        });
      }),
      fp.TE.tap((result) =>
        fp.TE.fromIO(() => {
          ctx.logger.debug.log("actor-find response: total=%d", result.total);
        }),
      ),
      throwTE,
    );

    // eslint-disable-next-line no-console
    console.log(JSON.stringify(result, null, 2));
  },
};
