import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { throwTE } from "@liexp/shared/lib/utils/fp.utils.js";
import axios from "axios";
import { getArg } from "../args.js";
import { type CommandModule } from "../command.type.js";

interface WikipediaSearchPage {
  id: number;
  key: string;
  title: string;
  description: string | null;
  thumbnail: { url: string } | null;
}

interface WikipediaArticleSummary {
  title: string;
  thumbnail?: { source: string; width: number; height: number };
  originalimage?: { source: string; width: number; height: number };
}

const WIKIPEDIA_BASE = "https://en.wikipedia.org";

const searchWikipedia = async (query: string): Promise<string> => {
  const searchRes = await axios.get<{ pages: WikipediaSearchPage[] }>(
    `${WIKIPEDIA_BASE}/w/rest.php/v1/search/page`,
    { params: { q: query, limit: 5 } },
  );
  const pages = searchRes.data.pages;
  if (!pages || pages.length === 0) {
    throw new Error(
      `No Wikipedia results found for "${query}". Try a more complete name.`,
    );
  }

  const summaryRes = await axios.get<WikipediaArticleSummary>(
    `${WIKIPEDIA_BASE}/api/rest_v1/page/summary/${encodeURIComponent(pages[0].title.replace(/ /g, "_"))}`,
  );
  const article = summaryRes.data;
  const image = article.originalimage ?? article.thumbnail;
  if (!image) {
    throw new Error(`No image found on Wikipedia for "${article.title}"`);
  }
  return image.source;
};

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
        () => searchWikipedia(fullName),
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
      fp.TE.tap((result) =>
        fp.TE.fromIO(() => {
          ctx.logger.debug.log(
            "actor find-avatar response: id=%s",
            result.data.id,
          );
        }),
      ),
      throwTE,
    );

    // eslint-disable-next-line no-console
    console.log(JSON.stringify(result, null, 2));
  },
};
