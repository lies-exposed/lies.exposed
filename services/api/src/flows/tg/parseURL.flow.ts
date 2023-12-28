import { pipe } from "@liexp/core/lib/fp/index.js";
import { isExcludedURL } from "@liexp/shared/lib/helpers/link.helper.js";
import { URL } from "@liexp/shared/lib/io/http/Common/URL.js";
import * as A from "fp-ts/lib/Array.js";
import * as E from "fp-ts/lib/Either.js";
import * as O from "fp-ts/lib/Option.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import type * as puppeteer from "puppeteer-core";
import { Equal } from "typeorm";
import { LinkEntity } from "#entities/Link.entity.js";
import { MediaEntity } from "#entities/Media.entity.js";
import { type UserEntity } from "#entities/User.entity.js";
import { type TEFlow } from "#flows/flow.types.js";
import { fetchAndSave } from "#flows/links/link.flow.js";
import {
  takeLinkScreenshot,
  uploadScreenshot,
} from "#flows/links/takeLinkScreenshot.flow.js";
import { toControllerError } from "#io/ControllerError.js";

export const parseURLs: TEFlow<
  [O.Option<URL[]>, UserEntity, puppeteer.Page],
  LinkEntity[]
> = (ctx) => (urls, user, page) =>
  pipe(
    urls,
    O.map((urls) =>
      urls.filter((u) => {
        const isURL = E.isRight(URL.decode(u));
        const isAllowed = !isExcludedURL(u);

        return isURL && isAllowed;
      }),
    ),
    O.getOrElse((): URL[] => []),
    A.map((url) => {
      return pipe(
        ctx.db.findOne(LinkEntity, {
          where: {
            url: Equal(url),
          },
        }),
        TE.chain((link) => {
          if (O.isSome(link)) {
            ctx.logger.info.log("Link found %s", link.value.id);
            return TE.right(link.value);
          }

          return pipe(
            fetchAndSave(ctx)(user, url),
            TE.chain((link) =>
              pipe(
                link.image?.thumbnail
                  ? TE.right(link)
                  : pipe(
                      takeLinkScreenshot(ctx)(link),
                      TE.chain((buffer) => uploadScreenshot(ctx)(link, buffer)),
                      TE.chain((screenshot) =>
                        ctx.db.save(MediaEntity, [
                          {
                            ...link.image,
                            ...screenshot,
                            label: link.title,
                            description: link.description,
                            links: [link],
                          },
                        ]),
                      ),
                      TE.map((media) => ({ ...link, image: media[0] })),
                    ),
              ),
            ),
            TE.mapLeft(toControllerError),
          );
        }),
      );
    }),
    A.sequence(TE.ApplicativeSeq),
  );
