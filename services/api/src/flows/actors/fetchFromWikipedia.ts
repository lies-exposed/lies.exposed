import { type AddActorBody } from "@liexp/shared/lib/io/http/Actor";
import { type URL } from "@liexp/shared/lib/io/http/Common";
import {
  $evalManyOrUndefined,
  toPuppeteerError,
} from "@liexp/shared/lib/providers/puppeteer.provider";
import { createExcerptValue } from "@liexp/shared/lib/slate";
import { generateRandomColor } from "@liexp/shared/lib/utils/colors";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/lib/function";
import snakeCase from "lodash/snakeCase";
import { type TEFlow } from "@flows/flow.types";
import { toControllerError } from "@io/ControllerError";

export const fetchFromWikipedia: TEFlow<[URL], AddActorBody> =
  (ctx) => (url) => {
    return pipe(
      ctx.puppeteer.getBrowserFirstPage(url, {}),
      TE.chain((page) => {
        return TE.tryCatch(async () => {
          const $evalSels = $evalManyOrUndefined(page);
          const fullName = await $evalSels(
            ["#mw-content-text .mw-parser-output p:not(.mw-empty-elt) b"],
            (el) => el.innerText
          );

          if (!fullName) {
            throw new Error('No actor name found');
          }

          const excerpt = await page.$eval(
            "#mw-content-text .mw-parser-output p:nth-of-type(2)",
            (el) => el?.innerText
          );

          const avatar = await $evalSels(
            [".infobox-image > a > img", ".thumb.tright a.image > img"],
            (el) => el?.src
          );

          const actor = {
            fullName,
            username: snakeCase(fullName.toLowerCase()),
            excerpt: createExcerptValue(excerpt),
            avatar,
            color: generateRandomColor().replace("#", ""),
            body: {},
          };

          return actor;
        }, toPuppeteerError);
      }),
      TE.mapLeft(toControllerError)
    );
  };
