import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { getRelationIdsFromEventRelations } from "@liexp/shared/lib/helpers/event/getEventRelationIds.js";
import { getSuggestions } from "@liexp/shared/lib/helpers/event-suggestion.js";
import { uuid } from "@liexp/shared/lib/io/http/Common/UUID.js";
import { type URL as URLT } from "@liexp/shared/lib/io/http/Common/index.js";
import { type EventType } from "@liexp/shared/lib/io/http/Events/EventType.js";
import { type ImageType } from "@liexp/shared/lib/io/http/Media/index.js";
import { toInitialValue } from "@liexp/ui/lib/components/Common/BlockNote/utils/utils.js";
import { parse } from "date-fns";
import { sequenceS } from "fp-ts/lib/Apply.js";
import * as O from "fp-ts/lib/Option.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { type Metadata } from "page-metadata-parser";
import type * as puppeteer from "puppeteer-core";
import { fetchAndSave } from "../links/link.flow.js";
import { extractRelationsFromURL } from "../nlp/extractRelationsFromURL.flow.js";
import { type EventV2Entity } from "#entities/Event.v2.entity.js";
import { type LinkEntity } from "#entities/Link.entity.js";
import { type UserEntity } from "#entities/User.entity.js";
import { type TEReader } from "#flows/flow.types.js";
import { toControllerError } from "#io/ControllerError.js";

const extractEventFromProviderLink =
  (
    p: puppeteer.Page,
    host: string,
    l: LinkEntity,
  ): TEReader<O.Option<Metadata>> =>
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
            .$$('//strong[contains(text(), "Results")]')
            .then((els) => els.at(0));

          // get "Results" element next element sibling
          const contentText = await contentTitle?.evaluate(
            (el) => el.nextSibling?.textContent,
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
  (
    p: puppeteer.Page,
    host: string,
    l: LinkEntity,
  ): TEReader<O.Option<EventV2Entity>> =>
  (ctx) => {
    return pipe(
      TE.Do,
      TE.bind("relations", () =>
        sequenceS(TE.ApplicativePar)({
          relations: extractRelationsFromURL(p, l.url)(ctx),
          provider: extractEventFromProviderLink(p, host, l)(ctx),
        }),
      ),
      TE.bind(
        "suggestions",
        ({
          relations: {
            relations: { entities },
            provider,
          },
        }) => {
          if (fp.O.isSome(provider)) {
            return pipe(
              TE.tryCatch(() => {
                return getSuggestions((v) =>
                  Promise.resolve(toInitialValue(v)),
                )(
                  provider.value,
                  O.some({
                    id: l.id,
                    title: l.title,
                    description: l.description ?? l.title,
                    publishDate: l.publishDate ?? undefined,
                    provider: l.provider as any,
                    creator: l.creator?.id,
                    url: l.url,
                    image: l.image
                      ? {
                          ...l.image,
                          label: l.image.label ?? undefined,
                          description: l.image.description ?? undefined,
                          thumbnail: l.image.thumbnail ?? undefined,
                          type: l.image as any as ImageType,
                          extra: l.image.extra ?? undefined,
                          events: [],
                          links: [],
                          keywords: [],
                          areas: [],
                        }
                      : undefined,
                    keywords: [],
                    events: [],
                    actors: [],
                    groups: [],
                    media: [],
                    socialPosts: [],
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    deletedAt: undefined,
                  }),
                  O.none,
                  getRelationIdsFromEventRelations({
                    groupsMembers: [],
                    media: [],
                    areas: [],
                    actors: entities.actors as any[],
                    groups: entities.groups as any[],
                    keywords: entities.keywords as any[],
                    links: entities.links as any[],
                  }),
                );
              }, toControllerError),
              TE.map((suggestions) =>
                suggestions.find((s) => s.event.type === "ScientificStudy"),
              ),
              TE.map(O.fromNullable),
            );
          }
          return TE.right(O.none);
        },
      ),

      TE.map(
        ({
          relations: {
            relations: { entities },
          },
          suggestions,
        }) =>
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

export interface DataPayload {
  keywords: string[];
  links: DataPayloadLink[];
}

export const extractEventFromURL =
  (
    p: puppeteer.Page,
    user: UserEntity,
    l: DataPayloadLink,
  ): TEReader<O.Option<EventV2Entity>> =>
  (ctx) => {
    const host = new URL(l.url).hostname;

    ctx.logger.debug.log("Extracting event from host %s (%s)", host, l.url);

    return pipe(
      fetchAndSave(user, l.url)(ctx),
      TE.chain((le) => extractByProvider(p, host, le)(ctx)),
    );
  };
