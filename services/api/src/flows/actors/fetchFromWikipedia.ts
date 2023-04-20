import { type AddActorBody } from "@liexp/shared/lib/io/http/Actor";
import { type URL } from "@liexp/shared/lib/io/http/Common";
import { toPuppeteerError } from "@liexp/shared/lib/providers/puppeteer.provider";
import { createExcerptValue } from "@liexp/shared/lib/slate";
import { generateRandomColor } from "@liexp/shared/lib/utils/colors";
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
          const lastParagraph = await page.$(
            "#mw-content-text .mw-parser-output p:nth-of-type(2) b"
          );
          let fullName: string;
          if (lastParagraph) {
            fullName = await page.$eval(
              "#mw-content-text .mw-parser-output p:nth-of-type(2) b",
              (el) => el.innerText
            );
          } else {
            fullName = await page.$eval(
              "#mw-content-text .mw-parser-output p:nth-of-type(1) b",
              (el) => el?.innerText
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
