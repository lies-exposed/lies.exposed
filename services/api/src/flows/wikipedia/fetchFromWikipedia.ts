import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { ensureHTTPS } from "@liexp/shared/lib/utils/media.utils.js";
import * as TE from "fp-ts/TaskEither";
import { type Page } from "wikipedia";
import { type TEFlow } from "#flows/flow.types.js";
import { toControllerError } from "#io/ControllerError.js";

interface LoadedPage {
  page: Page;
  featuredMedia: string | undefined;
  intro: string;
}

export const fetchFromWikipedia: TEFlow<[string], LoadedPage> =
  (ctx) => (pageId) => {
    return pipe(
      ctx.wp.parse(pageId),
      TE.mapLeft(toControllerError),
      TE.chain((p) => {
        return TE.tryCatch(async () => {
          const media = await p.media();

          const featuredMedia = pipe(
            media.items.filter((i) => i.type === "image"),
            fp.A.head,
            fp.O.chainNullableK((r) => r.srcset?.[0]?.src),
            fp.O.map((url) => ensureHTTPS(url)),
            fp.O.toUndefined,
          );

          const intro = await p.intro();

          return {
            page: p,
            featuredMedia,
            intro,
          };
        }, toControllerError);
      }),
    );
  };

export const searchAndParseFromWikipedia: TEFlow<[string], LoadedPage> =
  (ctx) => (search) => {
    return pipe(
      ctx.wp.search(search),
      TE.mapLeft(toControllerError),
      TE.chain((p) => fetchFromWikipedia(ctx)(p.results[0].pageid)),
    );
  };
