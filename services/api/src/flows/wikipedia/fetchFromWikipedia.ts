import { fp , pipe } from "@liexp/core/lib/fp/index.js";
import { ensureHTTPS } from "@liexp/shared/lib/utils/media.utils.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { type Page } from "wikipedia";
import { type TEFlow } from "#flows/flow.types.js";
import { toControllerError } from "#io/ControllerError.js";

interface LoadedPage {
  page: Page;
  avatar: string | undefined;
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

          const avatar = pipe(
            media.items.filter((i) => i.type === "image"),
            fp.A.head,
            fp.O.chainNullableK((r) => r.srcset?.[0]?.src),
            fp.O.map((url) => ensureHTTPS(url)),
            fp.O.toUndefined,
          );

          const intro = await p.intro();

          return {
            page: p,
            avatar,
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
