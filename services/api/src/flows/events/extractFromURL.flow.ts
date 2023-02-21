import { getSuggestions } from "@liexp/shared/helpers/event-suggestion";
import { type URL as URLT } from "@liexp/shared/io/http/Common";
import { uuid } from "@liexp/shared/utils/uuid";
import { parse } from "date-fns";
import * as O from "fp-ts/Option";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { type Metadata } from "page-metadata-parser";
import type * as puppeteer from "puppeteer-core";
import { fetchAndSave } from "../link.flow";
import { type EventV2Entity } from "@entities/Event.v2.entity";
import { type LinkEntity } from "@entities/Link.entity";
import { type UserEntity } from "@entities/User.entity";
import { type ControllerError, toControllerError } from "@io/ControllerError";
import { type RouteContext } from "@routes/route.types";
import { sequenceS } from "fp-ts/lib/Apply";
import { GetNERProvider } from "@liexp/shared/providers/ner/ner.provider";
import { ActorEntity } from "@entities/Actor.entity";
import { GroupEntity } from "@entities/Group.entity";

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
            (el) => el.nextSibling?.textContent
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
            (el) => el.nextSibling?.textContent
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
            (el) => el.nextSibling?.textContent
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
    const filePath = ctx.fs.resolve(`temp/urls/${l.id}.txt`);

    const cacheExists = ctx.fs.olderThan(filePath);

    return pipe(
      cacheExists,
      TE.chain((exists) => {
        if (!exists) {
          ctx.logger.debug.log("URL %s not cached, loading it...", filePath);
          return pipe(
            TE.tryCatch(async () => {
              await p.goto(l.url, {
                waitUntil: "networkidle0",
              });
              return await p.$eval("body", (b) => b.innerText);
            }, toControllerError),
            TE.chainFirst((text) => ctx.fs.writeObject(filePath, text))
          );
        }
        return pipe(ctx.fs.getObject(filePath), TE.mapLeft(toControllerError));
      }),
      TE.chain((text) => {
        const nerTask = pipe(
          sequenceS(TE.ApplicativeSeq)({
            actors: ctx.db.find(ActorEntity, { take: 100 }),
            groups: ctx.db.find(GroupEntity, { take: 100 }),
          }),
          TE.chain(({ actors, groups }) => {
            return pipe(
              GetNERProvider(ctx).process(text, [
                {
                  name: "actor",
                  patterns: actors.flatMap((a) => {
                    return [
                      a.fullName,
                      a.fullName.split(" ").reverse().join(" "),
                    ];
                  }),
                },
                {
                  name: "group",
                  patterns: groups.flatMap((g) => {
                    return [g.name, g.name.split(" ").reverse().join(" ")];
                  }),
                },
              ]),
              TE.map((details) => ({
                actors: details
                  .filter((d) => d.type === "actor")
                  .map((d) => actors.find((a) => a.fullName === d.value))
                  .filter((a): a is ActorEntity => a !== undefined),
                groups: details
                  .filter((d) => d.type === "group")
                  .map((d) => groups.find((a) => a.name === d.value))
                  .filter((a): a is GroupEntity => a !== undefined),
              }))
            );
          })
        );

        return pipe(
          sequenceS(TE.ApplicativePar)({
            ner: nerTask,
            provider: extractEventFromProviderLink(ctx)(p, host, l),
          }),
          TE.map(({ ner, provider }) =>
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
                    image: undefined,
                    keywords: [],
                    events: [],
                    actors: [],
                    groups: [],
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    deletedAt: undefined,
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
                actors: ner.actors,
                groups: ner.groups,
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
    user: UserEntity,
    l: DataPayloadLink
  ): TE.TaskEither<ControllerError, O.Option<EventV2Entity>> => {
    const host = new URL(l.url).hostname;

    ctx.logger.debug.log("Extracting event from host %s (%s)", host, l.url);

    return pipe(
      fetchAndSave(ctx)(user, l.url),
      TE.chain((le) => extractByProvider(ctx)(p, host, le))
    );
  };
