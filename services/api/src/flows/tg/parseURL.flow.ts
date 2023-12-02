import { isExcludedURL } from "@liexp/shared/lib/helpers/link.helper";
import { URL } from "@liexp/shared/lib/io/http/Common/URL";
import * as A from "fp-ts/Array";
import * as E from "fp-ts/Either";
import * as O from "fp-ts/Option";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import type * as puppeteer from "puppeteer-core";
import { Equal } from "typeorm";
import { LinkEntity } from "@entities/Link.entity";
import { MediaEntity } from '@entities/Media.entity';
import { type UserEntity } from "@entities/User.entity";
import { type TEFlow } from "@flows/flow.types";
import { fetchAndSave } from '@flows/links/link.flow';
import { takeLinkScreenshot, uploadScreenshot } from '@flows/links/takeLinkScreenshot.flow';
import { toControllerError } from '@io/ControllerError';

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
                      TE.chain((l) =>
                        ctx.db.save(MediaEntity, [
                          { ...link.image, ...l, links: [link] },
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
