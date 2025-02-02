import { pipe } from "@liexp/core/lib/fp/index.js";
import { sequenceS } from "fp-ts/lib/Apply.js";
import { type ReaderTaskEither } from "fp-ts/lib/ReaderTaskEither.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import type TelegramBot from "node-telegram-bot-api";
import { type DatabaseContext } from "../../context/db.context.js";
import { type ENVContext } from "../../context/env.context.js";
import { type TGBotProviderContext } from "../../context/index.js";
import { type LoggerContext } from "../../context/logger.context.js";
import { EventV2Entity } from "../../entities/Event.v2.entity.js";
import { KeywordEntity } from "../../entities/Keyword.entity.js";
import { type TG_BOT_ENV } from "../../io/ENV.js";
import { type DBError } from "../../providers/orm/index.js";
import { type TGError, toTGError } from "../../providers/tg/tg.provider.js";
import { LoggerService } from "../../services/logger/logger.service.js";

interface ToPinnedMessageOptions {
  bot: string;
  keywords: { tag: string; eventCount: number }[];
  keywordLimit: number;
  // actors: Array<{ fullName: string; eventCount: number }>;
  // actorLimit: number;
}

// TODO: to retrieve from db
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

export type UpsertPinnerMessageFlowContext = DatabaseContext &
  LoggerContext &
  ENVContext<TG_BOT_ENV> &
  TGBotProviderContext;

export const upsertPinnedMessage =
  <C extends UpsertPinnerMessageFlowContext>(
    limit: number,
  ): ReaderTaskEither<C, DBError | TGError, TelegramBot.Message> =>
  (ctx) => {
    ctx.logger.info.log("Fetch resources totals...");
    return pipe(
      sequenceS(TE.ApplicativePar)({
        keywords: ctx.db.execQuery((em) =>
          em
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
      LoggerService.TE.info(ctx, "Updated Pinned message"),
      TE.chain((message) => ctx.tg.upsertPinnedMessage(message)),
      TE.mapLeft(toTGError),
    );
  };
