import { pipe } from "@liexp/core/lib/fp/index.js";
import { sequenceS } from "fp-ts/lib/Apply.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import type TelegramBot from "node-telegram-bot-api";
import { EventV2Entity } from "#entities/Event.v2.entity.js";
import { KeywordEntity } from "#entities/Keyword.entity.js";
import { type TEFlow } from "#flows/flow.types.js";
import { toControllerError } from "#io/ControllerError.js";

interface ToPinnedMessageOptions {
  bot: string;
  keywords: Array<{ tag: string; eventCount: number }>;
  keywordLimit: number;
  // actors: Array<{ fullName: string; eventCount: number }>;
  // actorLimit: number;
}

// todo: to retrieve from db
export const toPinnedMessage = ({
  bot,
  keywords,
  keywordLimit,
}: // actors,
// actorLimit,
ToPinnedMessageOptions): string => `
Hello folks, this is the official channel of alpha.lies.exposed!\n\n
Lies Exposed is a collaborative project that collects and expose the lies perpetrated against humanity.\n\n
To contribute you can send a link to ${bot} or join the discussion chat.\n

The TOP ${keywordLimit} keywords:
${keywords.map((k) => `#${k.tag} (${k.eventCount})`).join("\n")}
\n
`;

export const upsertPinnedMessage: TEFlow<[number], TelegramBot.Message> =
  (ctx) => (limit) => {
    ctx.logger.info.log("Fetch resources totals...");
    return pipe(
      sequenceS(TE.ApplicativePar)({
        keywords: ctx.db.execQuery(() =>
          ctx.db.manager
            .createQueryBuilder(KeywordEntity, "k")
            .select()
            .loadAllRelationIds({ relations: ["events"] })
            .loadRelationCountAndMap("k.eventCount", "k.events")
            .addSelect((qb) => {
              return qb
                .select("COUNT(ev.id)", "count")
                .from(EventV2Entity, "ev"); // can't be mapped, but can be sorted. ( getMany )
            }, "count")
            .orderBy('"count"', "DESC")
            .limit(limit)
            .getMany(),
        ),
        // actors: ctx.db.execQuery(() =>
        //   ctx.db.manager
        //     .createQueryBuilder(ActorEntity, "a")
        //     .select()
        //     .leftJoinAndMapOne("a.eventCount", EventV2Entity, "event", where)
        //     .addSelect((qb) => {
        //       // can't be mapped, but can be sorted. ( getMany )
        //       return whereActorInArray(
        //         qb
        //           .select("COUNT(event.id)", "eventCount")
        //           .from(EventV2Entity, "event"),
        //         ['"a"."id"']
        //       );
        //     }, "eventCount")
        //     .orderBy('"eventCount"', "DESC")
        //     .limit(limit)
        //     .printSql()
        //     .getMany()
        // ),
      }),

      TE.map(({ keywords }) =>
        toPinnedMessage({
          bot: ctx.env.TG_BOT_USERNAME,
          keywords: keywords.filter((k) => k.eventCount >= 5),
          keywordLimit: limit,
          // actors: actors.filter((k) => k.eventCount > 5),
          // actorLimit: limit,
        }),
      ),
      ctx.logger.info.logInTaskEither("Updated Pinned message"),
      TE.chain((message) => ctx.tg.upsertPinnedMessage(message)),
      TE.mapLeft(toControllerError),
    );
  };
