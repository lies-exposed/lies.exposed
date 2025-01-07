import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { getUsernameFromDisplayName } from "@liexp/shared/lib/helpers/actor.js";
import { type ReaderTaskEither } from "fp-ts/lib/ReaderTaskEither.js";
import { type WikipediaProvider } from "../../providers/wikipedia/wikipedia.provider.js";

export interface LoadedPage {
  featuredMedia: string | undefined;
  slug: string;
  intro: string;
}

export type WikiProviders = "wikipedia" | "rationalwiki";

type FetchFromWikipediaFlow = (
  title: string,
) => ReaderTaskEither<WikipediaProvider, Error, LoadedPage>;

export const fetchFromWikipedia: FetchFromWikipediaFlow = (title) => (wp) => {
  return pipe(
    fp.TE.Do,
    fp.TE.bind("page", () => wp.articleSummary(title)),
    fp.TE.map(({ page }) => ({
      slug: getUsernameFromDisplayName(page.titles.canonical),
      featuredMedia: page.thumbnail?.source ?? page.originalimage?.source,
      intro: page.extract,
    })),
  );
};
