import { toPuppeteerError } from "@liexp/backend/lib/providers/puppeteer.provider";
import { searchWithGoogle } from "@liexp/backend/lib/scrapers/searchLinksWithGoogle";
import { AddEndpoint, Endpoints } from "@liexp/shared/lib/endpoints";
import { defaultSites } from "@liexp/shared/lib/utils/defaultSites";
import { type Router } from "express";
import * as A from "fp-ts/Array";
import * as O from "fp-ts/Option";
import * as Ord from "fp-ts/Ord";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import * as S from "fp-ts/string";
import { type LinkEntity } from "@entities/Link.entity";
import { fetchAsLink } from "@flows/links/link.flow";
import { getOneAdminOrFail } from "@flows/users/getOneUserOrFail.flow";
import { toControllerError } from "@io/ControllerError";
import { type RouteContext } from "@routes/route.types";

export const SearchEventsFromProviderRoute = (
  r: Router,
  ctx: RouteContext,
): void => {
  AddEndpoint(r)(
    Endpoints.Event.Custom.SearchEventsFromProvider,
    ({ body: { q, p, date: _date, providers, keywords } }) => {
      const date = O.toUndefined(_date);
      ctx.logger.debug.log("Query %O", { q, providers, keywords, date });

      const tasks = pipe(
        getOneAdminOrFail(ctx),
        TE.mapLeft(toPuppeteerError),
        TE.chain((user) =>
          pipe(
            ctx.puppeteer.getBrowser({}),
            TE.map((browser) => ({ browser, user })),
          ),
        ),
        TE.mapLeft(toControllerError),
        TE.chain(({ browser, user }) =>
          pipe(
            providers,
            A.map((provider) => {
              const site = (defaultSites as any)[provider];
              ctx.logger.debug.log("Provider %s (%s)", provider, site);
              return site;
            }),
            A.map((site) => {
              return pipe(
                searchWithGoogle(ctx, browser)(site, p, q, date, keywords),
                TE.mapLeft(toControllerError),
                TE.chain((ll) => {
                  return pipe(
                    ll.map((l: any) => fetchAsLink(ctx)(user, l, undefined)),
                    A.sequence(TE.ApplicativePar),
                  );
                }),
              );
            }),
            A.sequence(TE.ApplicativeSeq),
            TE.chainFirst(() => {
              return TE.tryCatch(() => browser.close(), toControllerError);
            }),
          ),
        ),
      );

      ctx.logger.debug.log("Search tasks %O", tasks);

      return pipe(
        tasks,
        TE.map((links) => {
          ctx.logger.debug.log("Links found %O", links);
          return pipe(
            A.flatten(links),
            A.uniq(Ord.contramap((p: LinkEntity) => p.url)(S.Ord)),
            (data) => ({
              data,
              total: data.length,
            }),
          );
        }),
        TE.map(({ data, total }) => ({
          body: {
            data,
            total,
          },
          statusCode: 200,
        })),
      );
    },
  );
};
