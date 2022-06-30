import { AddEndpoint, Endpoints } from "@liexp/shared/endpoints";
import { searchWithGoogle } from "@liexp/shared/scrapers/searchLinksWithGoogle";
import { Router } from "express";
import * as A from "fp-ts/lib/Array";
import * as Ord from "fp-ts/lib/Ord";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/function";
import * as S from "fp-ts/lib/string";
import { LinkEntity } from "@entities/Link.entity";
import { fetchAndCreate } from "@flows/link.flow";
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
    ({ body: { q, providers } }) => {
      ctx.logger.debug.log("Query %O", { q, providers });

      const tasks = pipe(
        providers,
        A.map((p) => {
          const site = (urls as any)[p];
          ctx.logger.debug.log("Provider %s (%s)", p, site);
          return site;
        }),
        A.map((site) => {
          return pipe(
            searchWithGoogle(ctx)(site, 5, q),
            TE.mapLeft(toControllerError),
            TE.chain((ll) => {
              return pipe(
                ll.map((l) => fetchAndCreate(ctx)(l as any)),
                A.sequence(TE.ApplicativePar)
              );
            })
          );
        })
      );

      ctx.logger.debug.log("Search tasks %O", tasks);

      return pipe(
        A.sequence(TE.ApplicativeSeq)(tasks),
        TE.map((links) => {
          return pipe(
            A.flatten(links),
            A.uniq(Ord.contramap((p: LinkEntity) => p.id)(S.Ord)),
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
