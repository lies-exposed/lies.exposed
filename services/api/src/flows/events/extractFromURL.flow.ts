import { pipe } from "@liexp/core/lib/fp/index.js";
import { getRelationIdsFromEventRelations } from "@liexp/shared/lib/helpers/event/getEventRelationIds.js";
import { getSuggestions } from "@liexp/shared/lib/helpers/event-suggestion.js";
import { type URL as URLT } from "@liexp/shared/lib/io/http/Common/index.js";
import { type ImageType } from "@liexp/shared/lib/io/http/Media.js";
import { uuid } from "@liexp/shared/lib/utils/uuid.js";
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
import { type TEFlow } from "#flows/flow.types.js";
import { toControllerError } from "#io/ControllerError.js";

const extractEventFromProviderLink: TEFlow<
  [puppeteer.Page, string, LinkEntity],
  O.Option<Metadata>
> = (ctx) => (p, host, l) => {
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
          .$x('//h3[contains(text(), "Results")]')
          .then((els) => els[0]);

        contentTitle =
          contentTitle ??
          (await p
            .$x('//h2[contains(text(), "Abstract")]')
            .then((els) => els[0]));

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
          .$eval(".article-source span.cit", (el) => el.innerHTML.split(";")[0])
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
          .$x('//strong[contains(text(), "Results")]')
          .then((els) => els[0]);

        // get "Results" element next element sibling
        const contentText = await contentTitle.evaluate(
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

const extractByProvider: TEFlow<
  [puppeteer.Page, string, LinkEntity],
  O.Option<EventV2Entity>
> = (ctx) => (p, host, l) => {
  return pipe(
    sequenceS(TE.ApplicativePar)({
      relations: extractRelationsFromURL(ctx)(p, l.url),
      provider: extractEventFromProviderLink(ctx)(p, host, l),
    }),
    TE.map(({ relations: { entities: relations }, provider }) =>
      pipe(
        provider,
        O.map((m) =>
          getSuggestions(
            m,
            O.some({
              id: l.id,
              title: l.title,
              description: l.description,
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
              actors: relations.actors as any[],
              groups: relations.groups as any[],
              keywords: relations.keywords as any[],
              links: relations.links as any[],
            }),
          ),
        ),
        O.chain((suggestions) =>
          O.fromNullable(
            suggestions.find((s) => s.event.type === "ScientificStudy"),
          ),
        ),
        O.map((s) => ({
          ...s.event,
          id: uuid() as any,
          excerpt: s.event.excerpt as any,
          body: s.event.body as any,
          links: [l],
          keywords: [],
          media: [],
          events: [],
          socialPosts: [],
          actors: relations.actors,
          groups: relations.groups,
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
  type: string;
}

export interface DataPayload {
  keywords: string[];
  links: DataPayloadLink[];
}

export const extractFromURL: TEFlow<
  [puppeteer.Page, UserEntity, DataPayloadLink],
  O.Option<EventV2Entity>
> = (ctx) => (p, user, l) => {
  const host = new URL(l.url).hostname;

  ctx.logger.debug.log("Extracting event from host %s (%s)", host, l.url);

  return pipe(
    fetchAndSave(ctx)(user, l.url),
    TE.chain((le) => extractByProvider(ctx)(p, host, le)),
  );
};
