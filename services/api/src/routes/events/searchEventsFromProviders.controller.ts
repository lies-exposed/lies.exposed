import { AddEndpoint, Endpoints } from "@liexp/shared/endpoints";
import { searchWithGoogle } from "@liexp/shared/scrapers/searchLinksWithGoogle";
import { Router } from "express";
import * as A from "fp-ts/lib/Array";
import * as Ord from "fp-ts/lib/Ord";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/function";
import * as S from "fp-ts/lib/string";
import { LinkEntity } from "@entities/Link.entity";
import { fetchAsLink } from "@flows/link.flow";
import { toControllerError } from "@io/ControllerError";
import { RouteContext } from "@routes/route.types";

const urls = {
  "the-guardian": "www.theguardian.com",
  reuters: "www.reuters.com",
};

export const SearchEventsFromProviderRoute = (
  r: Router,
  ctx: RouteContext
): void => {
  AddEndpoint(r)(
    Endpoints.Event.Custom.SearchEventsFromProvider,
    ({ body: { q, p, providers, keywords } }) => {
      ctx.logger.debug.log("Query %O", { q, providers, keywords });

      const tasks = pipe(
        ctx.puppeteer.getBrowser(`about:blank`, {
          headless: true,
        }),
        TE.mapLeft(toControllerError),
        TE.chain((browser) =>
          pipe(
            providers,
            A.map((provider) => {
              const site = (urls as any)[provider];
              ctx.logger.debug.log("Provider %s (%s)", provider, site);
              return site;
            }),
            A.map((site) => {
              return pipe(
                searchWithGoogle(ctx, browser)(site, p, q, keywords),
                TE.mapLeft(toControllerError),
                TE.chain((ll) => {
                  return pipe(
                    ll.map((l: any) => fetchAsLink(ctx)(l)),
                    A.sequence(TE.ApplicativePar)
                  );
                })
              );
            }),
            A.sequence(TE.ApplicativeSeq),
            TE.chainFirst(() => {
              return TE.tryCatch(
                async () => await browser.close(),
                toControllerError
              );
            })
          )
        )
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
            })
          );
        }),
        TE.map(({ data, total }) => ({
          body: {
            data,
            total,
          },
          statusCode: 200,
        }))
      );
    }
  );
};
