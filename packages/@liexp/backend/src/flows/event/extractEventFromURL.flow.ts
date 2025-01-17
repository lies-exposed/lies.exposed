import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { getRelationIdsFromEventRelations } from "@liexp/shared/lib/helpers/event/getEventRelationIds.js";
import { getSuggestions } from "@liexp/shared/lib/helpers/event-suggestion.js";
import { uuid } from "@liexp/shared/lib/io/http/Common/UUID.js";
import { type URL as URLT } from "@liexp/shared/lib/io/http/Common/index.js";
import {
  SCIENTIFIC_STUDY,
  type EventType,
} from "@liexp/shared/lib/io/http/Events/EventType.js";
import { toInitialValue } from "@liexp/shared/lib/providers/blocknote/utils.js";
import { parse } from "date-fns";
import * as O from "fp-ts/lib/Option.js";
import { type ReaderTaskEither } from "fp-ts/lib/ReaderTaskEither.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { type Metadata } from "page-metadata-parser";
import type * as puppeteer from "puppeteer-core";
import { type ConfigContext } from "../../context/config.context.js";
import { type DatabaseContext } from "../../context/db.context.js";
import { type FSClientContext } from "../../context/fs.context.js";
import { type NERProviderContext } from "../../context/index.js";
import { type LoggerContext } from "../../context/logger.context.js";
import { type URLMetadataContext } from "../../context/urlMetadata.context.js";
import { type EventV2Entity } from "../../entities/Event.v2.entity.js";
import { type LinkEntity } from "../../entities/Link.entity.js";
import { type UserEntity } from "../../entities/User.entity.js";
import { ServerError } from "../../errors/ServerError.js";
import { LinkIO } from "../../io/link.io.js";
import { extractRelationsFromURL } from "../admin/nlp/extractRelationsFromURL.flow.js";
import { fetchAndSave } from "../links/link.flow.js";

const extractPageMetadataFromProviderLink =
  <C extends LoggerContext>(
    p: puppeteer.Page,
    host: string,
    l: LinkEntity,
  ): ReaderTaskEither<C, ServerError, O.Option<Metadata>> =>
  (ctx) => {
    return TE.tryCatch(async () => {
      switch (host) {
        case "www.sciencedirect.com": {
          const title = await p.$eval("h1", (el) => el.children[1].innerHTML);

          await p.click("#show-more-btn");

          const date = await p
            .waitForSelector(".AuthorGroups")
            .then(async (d) => {
              const datesLabel = await p.$eval(".AuthorGroups", (el) =>
                el.nextElementSibling?.textContent?.split(", "),
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
            .$$('//h3[contains(text(), "Results")]')
            .then((els) => els.at(0));

          contentTitle =
            contentTitle ??
            (await p
              .$$('//h2[contains(text(), "Abstract")]')
              .then((els) => els.at(0)));

          // get "Results" element next element sibling
          const contentText = await contentTitle?.evaluate(
            (el) => el.nextSibling?.textContent,
          );

          return O.some({
            type: SCIENTIFIC_STUDY.value,
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
            el.innerHTML.replace(/\n/g, "").trim(),
          );

          const date = await p
            .$eval(
              ".article-source span.cit",
              (el) => el.innerHTML.split(";")[0],
            )
            .then((d) => {
              ctx.logger.debug.log("Date %s", d);

              return parse(d, "y MMM d", new Date());
            });

          // get "Results" element next element sibling
          const contentTitle = await p
            .$$('//strong[contains(text(), "Results")]')
            .then((els) => els.at(0));

          // get "Results" element next element sibling
          const contentText = await contentTitle?.evaluate(
            (el) => el.nextSibling?.textContent,
          );

          return O.some({
            type: SCIENTIFIC_STUDY.value,
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
            .$$('//strong[contains(text(), "Results")]')
            .then((els) => els.at(0));

          // get "Results" element next element sibling
          const contentText = await contentTitle?.evaluate(
            (el) => el.nextSibling?.textContent,
          );

          return O.some({
            type: SCIENTIFIC_STUDY.value,
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
    }, ServerError.fromUnknown);
  };

const extractByProvider =
  <
    C extends LoggerContext &
      ConfigContext &
      FSClientContext &
      NERProviderContext &
      DatabaseContext,
  >(
    p: puppeteer.Page,
    host: string,
    l: LinkEntity,
    type: EventType,
  ): ReaderTaskEither<C, ServerError, O.Option<EventV2Entity>> =>
  (ctx) => {
    return pipe(
      TE.Do,
      TE.bind("relations", () => extractRelationsFromURL(p, l.url)(ctx)),
      TE.bind("provider", () =>
        extractPageMetadataFromProviderLink(p, host, l)(ctx),
      ),
      TE.bind("metadata", ({ provider }) => {
        if (fp.O.isSome(provider)) {
          return fp.TE.right(provider.value);
        }

        return fp.TE.right({
          url: l.url,
          title: l.title,
          description: l.description ?? l.title,
          keywords: [],
          image: l.image?.id ?? null,
          icon: "",
          provider: undefined,
          type,
        } satisfies Metadata);
      }),
      TE.bind("suggestions", ({ relations: { entities }, metadata }) => {
        return pipe(
          TE.Do,
          TE.bind("link", () => {
            return pipe(
              LinkIO.decodeSingle(l),
              fp.E.fold(() => fp.O.none, fp.O.some),
              fp.TE.right,
            );
          }),

          TE.bind("relations", () =>
            pipe(
              fp.TE.right(
                getRelationIdsFromEventRelations({
                  groupsMembers: [],
                  media: [],
                  areas: [],
                  actors: entities.actors as any[],
                  groups: entities.groups as any[],
                  keywords: entities.keywords as any[],
                  links: entities.links as any[],
                }),
              ),
            ),
          ),
          TE.chain(({ link, relations }) =>
            TE.tryCatch(() => {
              const suggestionMaker = getSuggestions((v) =>
                Promise.resolve(toInitialValue(v)),
              );

              return suggestionMaker(metadata, link, O.none, relations);
            }, ServerError.fromUnknown),
          ),
          TE.map((suggestions) => {
            return suggestions.find((s) => s.event.type === type);
          }),
          TE.map(O.fromNullable),
        );
      }),

      TE.map(({ relations: { entities }, suggestions }) =>
        pipe(
          suggestions,
          O.map((s) => ({
            ...s.event,
            id: uuid(),
            excerpt: s.event.excerpt ?? null,
            body: s.event.body ?? null,
            location: null,
            links: [l],
            keywords: [],
            media: [],
            events: [],
            socialPosts: [],
            actors: entities.actors,
            groups: entities.groups,
            stories: [],
            createdAt: new Date(),
            updatedAt: new Date(),
            deletedAt: null,
          })),
        ),
      ),
    );
  };

export interface DataPayloadLink {
  url: URLT;
  type: EventType;
}

export const extractEventFromURL =
  <
    C extends LoggerContext &
      ConfigContext &
      FSClientContext &
      NERProviderContext &
      DatabaseContext &
      URLMetadataContext,
  >(
    p: puppeteer.Page,
    user: UserEntity,
    l: DataPayloadLink,
  ): ReaderTaskEither<C, ServerError, O.Option<EventV2Entity>> =>
  (ctx) => {
    const host = new URL(l.url).hostname;

    ctx.logger.debug.log("Extracting event from host %s (%s)", host, l.url);

    return pipe(
      fp.RTE.Do,
      fp.RTE.bind("event", () => fetchAndSave<C>(user, l.url)),
      fp.RTE.chain(({ event }) => {
        return pipe(extractByProvider<C>(p, host, event, l.type));
      }),
    )(ctx);
  };
