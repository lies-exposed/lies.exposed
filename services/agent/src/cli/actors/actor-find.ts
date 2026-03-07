import { FindActorsInputSchema } from "@liexp/shared/lib/mcp/schemas/actors.schemas.js";
import { getArg } from "../args.js";
import { type CommandModule } from "../command.type.js";
import { runCommand } from "../run-command.js";

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
    return runCommand(
      ctx,
      FindActorsInputSchema,
      {
        fullName: getArg(args, "fullName"),
        memberIn: memberInArg ? [memberInArg] : [],
        withDeleted: args.includes("--withDeleted") ? true : undefined,
        sort: getArg(args, "sort"),
        order: getArg(args, "order"),
        start: getArg(args, "start"),
        end: getArg(args, "end"),
      },
      (input) => {
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
      },
    );
  },
};
