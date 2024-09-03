import { type WikipediaProvider } from "@liexp/backend/lib/providers/wikipedia/wikipedia.provider.js";
import { pipe } from "@liexp/core/lib/fp/index.js";
import { getUsernameFromDisplayName } from "@liexp/shared/lib/helpers/actor.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { type TEFlow } from "#flows/flow.types.js";
import { toControllerError } from "#io/ControllerError.js";

interface LoadedPage {
  featuredMedia: string | undefined;
  slug: string;
  intro: string;
}

export type WikiProviders = "wikipedia" | "rationalwiki";

type FetchFromWikipediaFlow = TEFlow<[string], LoadedPage, WikipediaProvider>;

export const fetchFromWikipedia: FetchFromWikipediaFlow =
  (wp: WikipediaProvider) => (title) => {
    return pipe(
      TE.Do,
      TE.bind("page", () =>
        pipe(wp.articleSummary(title), TE.mapLeft(toControllerError)),
      ),
      TE.map(({ page }) => ({
        slug: getUsernameFromDisplayName(page.titles.canonical),
        featuredMedia: page.thumbnail?.source ?? page.originalimage?.source,
        intro: page.extract,
      })),
    );
  };

export const searchAndParseFromWikipedia: FetchFromWikipediaFlow =
  (wp) => (search) => {
    return pipe(
      wp.search(search),
      TE.mapLeft(toControllerError),
      TE.chain((p) => fetchFromWikipedia(wp)(p[0].title)),
    );
  };
