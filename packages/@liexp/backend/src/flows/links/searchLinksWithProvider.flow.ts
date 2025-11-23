import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { type Endpoints } from "@liexp/shared/lib/endpoints/api/index.js";
import { type URL } from "@liexp/shared/lib/io/http/Common/URL.js";
import { defaultSites } from "@liexp/shared/lib/utils/defaultSites.js";
import * as A from "fp-ts/lib/Array.js";
import * as Ord from "fp-ts/lib/Ord.js";
import { type ReaderTaskEither } from "fp-ts/lib/ReaderTaskEither";
import * as TE from "fp-ts/lib/TaskEither.js";
import * as S from "fp-ts/lib/string.js";
import { type DatabaseContext } from "../../context/db.context.js";
import { type LoggerContext } from "../../context/logger.context.js";
import { type PuppeteerProviderContext } from "../../context/puppeteer.context.js";
import { type URLMetadataContext } from "../../context/urlMetadata.context.js";
import { type LinkEntity } from "../../entities/Link.entity.js";
import { type UserEntity } from "../../entities/User.entity.js";
import { ServerError } from "../../errors/ServerError.js";
import { LinkIO } from "../../io/link.io.js";
import { toPuppeteerError } from "../../providers/puppeteer.provider.js";
import { searchWithGoogle } from "../../scrapers/searchLinksWithGoogle.js";
import { fromURL } from "./link.flow.js";

export const searchEventsFromProvider =
  <
    C extends PuppeteerProviderContext &
      LoggerContext &
      URLMetadataContext &
      DatabaseContext,
  >(
    {
      query,
      page,
      date,
      providers,
      keywords,
    }: typeof Endpoints.Event.Custom.SearchEventsFromProvider.Input.Body.Encoded,
    user: UserEntity,
  ): ReaderTaskEither<C, ServerError, any> =>
  (ctx) => {
    const tasks = pipe(
      pipe(
        ctx.puppeteer.getBrowser({}),
        TE.map((browser) => ({ browser })),
      ),
      TE.mapLeft(toPuppeteerError),
      TE.chain(({ browser }) =>
        pipe(
          providers,
          fp.A.map((provider) => {
            const site = defaultSites[provider as keyof typeof defaultSites];
            ctx.logger.debug.log("Provider %s (%s)", provider, site);
            return site;
          }),
          fp.A.map((site) => {
            return pipe(
              searchWithGoogle(ctx, browser)(
                site,
                page,
                query,
                date ?? undefined,
                keywords,
              ),
              TE.mapLeft(ServerError.fromUnknown),
              TE.chain((ll) => {
                return pipe(
                  ll.map((l) => fromURL(user, l as URL, undefined)(ctx)),
                  A.sequence(TE.ApplicativePar),
                  TE.mapLeft(ServerError.fromUnknown),
                );
              }),
            );
          }),
          fp.A.sequence(TE.ApplicativeSeq),
          TE.chainFirst(() => {
            return TE.tryCatch(() => browser.close(), ServerError.fromUnknown);
          }),
        ),
      ),
    );

    ctx.logger.debug.log("Search tasks %O", tasks);

    return pipe(
      tasks,
      TE.chainEitherK((links) => {
        ctx.logger.debug.log("Links found %O", links);
        return pipe(
          fp.A.flatten(links),
          fp.A.uniq(Ord.contramap((link: LinkEntity) => link.url)(S.Ord)),
          (links) => LinkIO.decodeMany(links),
          fp.E.map((data) => ({
            data,
            total: data.length,
          })),
        );
      }),
    );
  };
