import { type LinkEntity } from "@liexp/backend/lib/entities/Link.entity.js";
import { fromURL } from "@liexp/backend/lib/flows/links/link.flow.js";
import { getOneAdminOrFail } from "@liexp/backend/lib/flows/user/getOneUserOrFail.flow.js";
import { LinkIO } from "@liexp/backend/lib/io/link.io.js";
import { toPuppeteerError } from "@liexp/backend/lib/providers/puppeteer.provider.js";
import { searchWithGoogle } from "@liexp/backend/lib/scrapers/searchLinksWithGoogle.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import { defaultSites } from "@liexp/shared/lib/utils/defaultSites.js";
import { type Router } from "express";
import * as A from "fp-ts/lib/Array.js";
import * as O from "fp-ts/lib/Option.js";
import * as Ord from "fp-ts/lib/Ord.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import * as S from "fp-ts/lib/string.js";
import { type ServerContext } from "#context/context.type.js";
import { toControllerError } from "#io/ControllerError.js";
import { AddEndpoint } from "#routes/endpoint.subscriber.js";

export const SearchEventsFromProviderRoute = (
  r: Router,
  ctx: ServerContext,
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
            fp.A.map((provider) => {
              const site = (defaultSites as any)[provider];
              ctx.logger.debug.log("Provider %s (%s)", provider, site);
              return site;
            }),
            fp.A.map((site) => {
              return pipe(
                searchWithGoogle(ctx, browser)(site, p, q, date, keywords),
                TE.mapLeft(toControllerError),
                TE.chain((ll) => {
                  return pipe(
                    ll.map((l: any) =>
                      fromURL<ServerContext>(user, l, undefined)(ctx),
                    ),
                    A.sequence(TE.ApplicativePar),
                    TE.mapLeft(toControllerError),
                  );
                }),
              );
            }),
            fp.A.sequence(TE.ApplicativeSeq),
            TE.chainFirst(() => {
              return TE.tryCatch(() => browser.close(), toControllerError);
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
            fp.A.uniq(Ord.contramap((p: LinkEntity) => p.url)(S.Ord)),
            LinkIO.decodeMany,
            fp.E.map((data) => ({
              data,
              total: data.length,
            })),
          );
        }),
        TE.map(({ data, total }) => ({
          body: {
            data: data.map(
              (d) =>
                ({
                  ...d,
                  // TODO: fix this
                  type: "Update" as const,
                  eventId: "" as any,
                  event: {} as any,
                }) as any,
            ),
            total,
          },
          statusCode: 200,
        })),
      );
    },
  );
};
