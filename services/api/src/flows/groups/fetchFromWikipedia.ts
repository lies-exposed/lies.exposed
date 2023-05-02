import { type URL } from "@liexp/shared/lib/io/http/Common";
import { type CreateGroupBody } from "@liexp/shared/lib/io/http/Group";
import {
  $evalManyOrThrow,
  toPuppeteerError,
} from "@liexp/shared/lib/providers/puppeteer.provider";
import { createExcerptValue } from "@liexp/shared/lib/slate";
import { generateRandomColor } from "@liexp/shared/lib/utils/colors";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/lib/function";
import { type TEFlow } from "@flows/flow.types";
import { toControllerError } from "@io/ControllerError";

export const fetchFromWikipedia: TEFlow<[URL], CreateGroupBody> =
  (ctx) => (url) => {
    return pipe(
      ctx.puppeteer.getBrowserFirstPage(url, {}),
      TE.chain((page) => {
        return TE.tryCatch(async () => {
          const evalSels = $evalManyOrThrow(page);
          const groupName = await evalSels(
            [
              "#mw-content-text .mw-parser-output p:nth-of-type(2) b",
              "#mw-content-text .mw-parser-output p:nth-of-type(1) b",
            ],
            (el) => el?.innerText
          );

          const excerpt = await page.$eval(
            "#mw-content-text .mw-parser-output p:nth-of-type(2)",
            (el) => el.innerText
          );

          const avatar = await evalSels(
            [".infobox-image > a > img", ".thumb.tright a.image > img"],
            (el) => el.src
          );

          const group = {
            name: groupName,
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
