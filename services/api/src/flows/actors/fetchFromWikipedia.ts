import { type AddActorBody } from "@liexp/shared/lib/io/http/Actor";
import { type URL } from "@liexp/shared/lib/io/http/Common";
import { toPuppeteerError } from "@liexp/shared/lib/providers/puppeteer.provider";
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
          const fullNameEl = await page.$(
            "#mw-content-text .mw-parser-output p:not(.mw-empty-elt) b"
          );
          let fullName: string = "";
          if (fullNameEl) {
            fullName = await page.$eval(
              "#mw-content-text .mw-parser-output p:not(.mw-empty-elt) b",
              (el) => el.innerText
            );
          }

          const excerpt = await page.$eval(
            "#mw-content-text .mw-parser-output p:nth-of-type(2)",
            (el) => el?.innerText
          );

          const avatarNode = await page.$(".infobox-image > a > img");
          let avatar: string | undefined;
          if (avatarNode) {
            avatar = await page.$eval(
              ".infobox-image > a > img",
              (el) => el?.src
            );
          }

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
