import { fp } from "@liexp/core/lib/fp";
import { ensureHTTPS } from "@liexp/shared/lib/utils/media.utils";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { type Page } from "wikipedia";
import { type TEFlow } from "@flows/flow.types";
import { toControllerError } from "@io/ControllerError";

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
