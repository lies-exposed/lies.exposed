import { getSuggestions } from "@liexp/shared/helpers/event-suggestion";
import { URL as URLT } from "@liexp/shared/io/http/Common";
import { uuid } from "@liexp/shared/utils/uuid";
import { parse } from "date-fns";
import * as O from "fp-ts/lib/Option";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/function";
import { Metadata } from "page-metadata-parser";
import * as puppeteer from "puppeteer-core";
import { fetchAndSave } from "../link.flow";
import { EventV2Entity } from "@entities/Event.v2.entity";
import { LinkEntity } from "@entities/Link.entity";
import { ControllerError, toControllerError } from "@io/ControllerError";
import { RouteContext } from "@routes/route.types";

const extractEventFromProviderLink =
  (ctx: RouteContext) =>
  (
    p: puppeteer.Page,
    host: string,
    l: LinkEntity
  ): TE.TaskEither<ControllerError, O.Option<Metadata>> => {
    return TE.tryCatch(async () => {
      switch (host) {
        case "www.sciencedirect.com": {
          const title = await p.$eval("h1", (el) => el.children[1].innerHTML);

          await p.click("#show-more-btn");

          const date = await p
            .waitForSelector(".AuthorGroups")
            .then(async (d) => {
              const datesLabel = await p.$eval(".AuthorGroups", (el) =>
                el.nextElementSibling?.textContent?.split(", ")
              );

              ctx.logger.debug.log("Extract date from %s", datesLabel);

              const date = datesLabel?.find((l) => l.startsWith("Accepted"));
              ctx.logger.debug.log("Date %s", date);
              return date
                ? parse(date.replace("Accepted ", ""), "d MMMM y", new Date())
                : new Date();
            });

          // get "Results" element next element sibling
          let contentTitle = await p
            .$x('//h3[contains(text(), "Results")]')
            .then((els) => els[0]);

          contentTitle =
            contentTitle ??
            (await p
              .$x('//h2[contains(text(), "Abstract")]')
              .then((els) => els[0]));

          // get "Results" element next element sibling
          const contentText = await contentTitle?.evaluate(
            (el) => el.nextElementSibling?.textContent
          );

          return O.some({
            type: "ScientificStudy",
            title,
            date: date.toISOString(),
            description: contentText ?? "",
            url: l.url,
            keywords: [],
            image: "",
            icon: "",
            provider: host,
          });
        }
        case "pubmed.ncbi.nlm.nih.gov": {
          const title = await p.$eval("h1", (el) =>
            el.innerHTML.replace(/\n/g, "").trim()
          );

          const date = await p
            .$eval(
              ".article-source span.cit",
              (el) => el.innerHTML.split(";")[0]
            )
            .then((d) => {
              ctx.logger.debug.log("Date %s", d);

              return parse(d, "y MMM d", new Date());
            });

          // get "Results" element next element sibling
          const contentTitle = await p
            .$x('//strong[contains(text(), "Results")]')
            .then((els) => els[0]);

          // get "Results" element next element sibling
          const contentText = await contentTitle.evaluate(
            (el) => el.nextElementSibling?.innerHTML
          );

          return O.some({
            type: "ScientificStudy",
            title,
            date: date.toISOString(),
            description: contentText ?? "",
            url: l.url,
            keywords: [],
            image: "",
            icon: "",
            provider: host,
          });
        }
        case "jamanetwork.com": {
          const title = await p.$eval("h1", (el) => el.innerHTML);
          const date = await p
            .$eval(".meta-date", (el) => el.innerHTML)
            .then((d) => parse(d, "MMMM d, y", new Date()));

          // search for strong el with "Results" text
          const contentTitle = await p
            .$x('//strong[contains(text(), "Results")]')
            .then((els) => els[0]);

          // get "Results" element next element sibling
          const contentText = await contentTitle.evaluate(
            (el) => el.nextElementSibling?.innerHTML
          );

          return O.some({
            type: "ScientificStudy",
            title,
            date: date.toISOString(),
            description: contentText ?? "",
            url: l.url,
            keywords: [],
            image: "",
            icon: "",
            provider: host,
          });
        }
        default: {
          return O.none;
        }
      }
    }, toControllerError);
  };

const extractByProvider =
  (ctx: RouteContext) =>
  (
    p: puppeteer.Page,
    host: string,
    l: LinkEntity
  ): TE.TaskEither<ControllerError, O.Option<EventV2Entity>> => {
    return pipe(
      TE.tryCatch(async () => {
        await p.goto(l.url, {
          waitUntil: "networkidle0",
        });
        return p;
      }, toControllerError),
      TE.chain((p) => {
        return pipe(
          extractEventFromProviderLink(ctx)(p, host, l),
          ctx.logger.debug.logInTaskEither("extracted event %O"),
          TE.map((metadataOpt) =>
            pipe(
              metadataOpt,
              O.map((m) =>
                getSuggestions(
                  m,
                  O.some({
                    id: l.id,
                    title: l.title,
                    description: l.description,
                    publishDate: l.publishDate ?? undefined,
                    provider: l.provider as any,
                    url: l.url,
                    image: undefined,
                    keywords: [],
                    events: [],
                    createdAt: new Date(),
                    updatedAt: new Date(),
                  }),
                  O.none
                )
              ),
              O.chain((suggestions) =>
                O.fromNullable(
                  suggestions.find((s) => s.event.type === "ScientificStudy")
                )
              ),
              O.map((s) => ({
                ...s.event,
                id: uuid() as any,
                excerpt: s.event.excerpt as any,
                body: s.event.body as any,
                links: [l],
                keywords: [],
                media: [],
                createdAt: new Date(),
                updatedAt: new Date(),
                deletedAt: null,
              }))
            )
          )
        );
      })
    );
  };

export interface DataPayloadLink {
  url: URLT;
  type: string;
}

export interface DataPayload {
  keywords: string[];
  links: DataPayloadLink[];
}

export const extractFromURL =
  (ctx: RouteContext) =>
  (
    p: puppeteer.Page,
    l: DataPayloadLink
  ): TE.TaskEither<ControllerError, O.Option<EventV2Entity>> => {
    const host = new URL(l.url).hostname;

    ctx.logger.debug.log("Extracting event from host %s (%s)", host, l.url);

    return pipe(
      fetchAndSave(ctx)(l.url),
      TE.chain((le) => extractByProvider(ctx)(p, host, le))
    );
  };
