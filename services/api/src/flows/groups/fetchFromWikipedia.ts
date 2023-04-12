import { type URL } from "@liexp/shared/lib/io/http/Common";
import { type CreateGroupBody } from "@liexp/shared/lib/io/http/Group";
import { toPuppeteerError } from "@liexp/shared/lib/providers/puppeteer.provider";
import { createExcerptValue } from "@liexp/shared/lib/slate";
import { generateRandomColor } from "@liexp/shared/lib/utils/colors";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/lib/function";
import { toControllerError, type ControllerError } from "@io/ControllerError";
import { type RouteContext } from "@routes/route.types";

export const fetchFromWikipedia =
  (ctx: RouteContext) =>
  (url: URL): TE.TaskEither<ControllerError, CreateGroupBody> => {
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

          const group = {
            name: fullName,
            kind: "Public" as const,
            startDate: new Date(),
            endDate: undefined,
            members: [],
            excerpt: createExcerptValue(excerpt),
            avatar,
            color: generateRandomColor(),
            body: {},
          };

          return group;
        }, toPuppeteerError);
      }),
      TE.mapLeft(toControllerError)
    );
  };
