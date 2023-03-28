import { type AddActorBody } from "@liexp/shared/io/http/Actor";
import { type URL } from "@liexp/shared/io/http/Common";
import { toPuppeteerError } from "@liexp/shared/providers/puppeteer.provider";
import { createExcerptValue } from "@liexp/shared/slate";
import { generateRandomColor } from "@liexp/shared/utils/colors";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/lib/function";
import snakeCase from "lodash/snakeCase";
import { toControllerError, type ControllerError } from "@io/ControllerError";
import { type RouteContext } from "@routes/route.types";

export const fetchFromWikipedia =
  (ctx: RouteContext) =>
  (url: URL): TE.TaskEither<ControllerError, AddActorBody> => {
    return pipe(
      ctx.puppeteer.getBrowserFirstPage(url, {}),
      TE.chain((page) => {
        return TE.tryCatch(async () => {
          const fullName = await page.$eval(
            "#mw-content-text .mw-parser-output p:nth-of-type(2) b",
            (el) => el.innerText
          );
          const excerpt = await page.$eval(
            "#mw-content-text .mw-parser-output p:nth-of-type(2)",
            (el) => el.innerText
          );

          const avatar = await page.$eval(
            ".infobox-image > a > img",
            (el) => el.src
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
