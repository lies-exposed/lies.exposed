import { EventV2Entity } from "@entities/Event.v2.entity";
import { ServerError } from "@io/ControllerError";
import { AddEndpoint, Endpoints } from "@liexp/shared/endpoints";
import { Route } from "@routes/route.types";
import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/lib/TaskEither";
import * as A from "fp-ts/lib/Array";
import { Raw } from "typeorm";
import subWeek from "date-fns/sub_weeks";
import addWeek from "date-fns/add_weeks";

export const MakeGetEventFromLinkRoute: Route = (r, ctx) => {
  AddEndpoint(r)(Endpoints.Event.Custom.GetFromLink, ({ query: { url } }) => {
    ctx.logger.debug.log("Get event from link %s", url);
    return pipe(
      ctx.urlMetadata.fetchMetadata(url, {}, (e) => ServerError()),
      TE.chain((metadata) => {
        ctx.logger.debug.log("Metadata for url %O", metadata);
        const trimmedWords = (metadata.title ?? "").replace(
          /[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi,
          " "
        );
        ctx.logger.debug.log(
          "Trimmed words from title '%s' \n '%O'",
          trimmedWords
        );

        const mainTitleWords = trimmedWords
          .split(" ")
          .filter((l) => l.length >= 5)
          .sort((a, b) => b.length - a.length)
          .slice(0, 3)
          .join(" & ");

        ctx.logger.debug.log("Main title words %O", mainTitleWords);

        const minDate = subWeek(metadata.date ?? new Date(), 1);
        const maxDate = addWeek(metadata.date ?? new Date(), 1);

        const query = ctx.db.manager
          .createQueryBuilder(EventV2Entity, "event")
          .select()
          .addSelect(
            `ts_rank_cd(
          to_tsvector('english', "event"."payload"::jsonb ->> 'title'), to_tsquery(:q)
        ) AS title_score`
          )
          .where({
            type: "Uncategorized",
            date: Raw(
              (alias) => `${alias} > :minDate AND ${alias} < :maxDate`,
              {
                minDate,
                maxDate,
              }
            ),
          })
          .orderBy("title_score", "DESC")
          .take(10)
          .setParameter("q", mainTitleWords);

        ctx.logger.debug.log("SQL %s", query.getSql());

        return ctx.db.execQuery(() => query.getRawAndEntities());
      }),
      TE.map((data) =>
        pipe(
          data.raw,
          A.zip(data.entities),
          A.filter(([raw, _entity]) => raw.title_score >= 0.02),
          A.map(([raw, entity]) => ({
            ...entity,
            score: raw.title_score,
          }))
        )
      ),
      ctx.logger.debug.logInTaskEither("Events %O"),
      TE.map((data) => ({
        body: {
          data,
        } as any,
        statusCode: 200,
      }))
    );
  });
};
