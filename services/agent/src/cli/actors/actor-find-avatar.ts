import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { throwTE } from "@liexp/shared/lib/utils/fp.utils.js";
import { getArg } from "../args.js";
import { type CommandModule } from "../command.type.js";
import { searchWikipediaImageUrl } from "../wikipedia.js";

export const actorFindAvatar: CommandModule = {
  help: `
Usage: agent actor find-avatar [options]

Search Wikipedia for an actor's profile image and upload it as a media entry.
Returns the media UUID to use with actor create/edit --avatar.

Options:
  --fullName=<string>    Full name of the actor to search on Wikipedia (required)
  --help                 Show this help message

Output: JSON created media object (use .data.id as the avatar UUID)
`,
  run: async (ctx, args) => {
    const fullName = getArg(args, "fullName");
    if (!fullName) {
      throw new Error("--fullName=<string> is required");
    }

    const result = await pipe(
      fp.TE.tryCatch(
        () => searchWikipediaImageUrl(fullName),
        (e) =>
          e instanceof Error
            ? e
            : new Error(`Wikipedia search failed: ${String(e)}`),
      ),
      fp.TE.chainW((imageUrl) => {
        ctx.logger.debug.log("actor find-avatar: found image url=%s", imageUrl);
        return ctx.api.Media.Create({
          Body: {
            id: undefined,
            location: imageUrl as any,
            type: "image/jpg" as any,
            label: `${fullName} Avatar`,
            description: `Avatar/profile image for ${fullName} from Wikipedia`,
            thumbnail: undefined,
            extra: undefined,
            events: [],
            links: [],
            keywords: [],
            areas: [],
          },
        });
      }),
      throwTE,
    );

    // eslint-disable-next-line no-console
    console.log(JSON.stringify(result, null, 2));
  },
};
