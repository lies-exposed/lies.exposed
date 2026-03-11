import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { type MediaType } from "@liexp/io/lib/http/Media/MediaType.js";
import { throwTE } from "@liexp/shared/lib/utils/fp.utils.js";
import { getArg } from "../args.js";
import { type CommandModule } from "../command.type.js";
import { searchWikipediaImageUrl } from "../wikipedia.js";

export const groupFindAvatar: CommandModule = {
  help: `
Usage: agent group find-avatar [options]

Search Wikipedia for a group/organization's logo or image and upload it as a media entry.
Returns the media UUID to use with group create/edit --avatar.

Options:
  --name=<string>    Name of the group/organization to search on Wikipedia (required)
  --help             Show this help message

Output: JSON created media object (use .data.id as the avatar UUID)
`,
  run: async (ctx, args) => {
    const name = getArg(args, "name");
    if (!name) {
      throw new Error("--name=<string> is required");
    }

    const result = await pipe(
      fp.TE.tryCatch(
        () => searchWikipediaImageUrl(name),
        (e) =>
          e instanceof Error
            ? e
            : new Error(`Wikipedia search failed: ${String(e)}`),
      ),
      fp.TE.chainW((imageUrl) => {
        ctx.logger.debug.log("group find-avatar: found image url=%s", imageUrl);
        return ctx.api.Media.Create({
          Body: {
            id: undefined,
            location: imageUrl,
            type: "image/jpg" as MediaType,
            label: `${name} Avatar`,
            description: `Logo/image for ${name} from Wikipedia`,
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
