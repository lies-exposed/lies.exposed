/* eslint-disable @typescript-eslint/no-var-requires */
require("module-alias")(process.cwd());

import { EventV2Entity } from "@entities/Event.v2.entity";
import { fetchAndSave } from "@flows/links/link.flow";
import { getOneAdminOrFail } from "@flows/users/getOneUserOrFail.flow";
import { fp } from "@liexp/core/lib/fp";
import { throwTE } from "@liexp/shared/lib/utils/task.utils";
import { sequenceS } from "fp-ts/lib/Apply";
import { pipe } from "fp-ts/lib/function";
import { startContext, stopContext } from "./start-ctx";
import { Brackets } from "typeorm";

/**
 * Usage ts-node ./bin/create-from-wikipedia $search
 *
 * $search      text used as query for wikipedia search api
 *
 * @returns void
 */
const run = async (): Promise<any> => {
  const ctx = await startContext();

  const events = await pipe(
    sequenceS(fp.TE.ApplicativePar)({
      creator: getOneAdminOrFail(ctx),
      events: pipe(
        ctx.db.execQuery(() => {
          const q = ctx.db.manager
            .createQueryBuilder(EventV2Entity, "event")
            .where(
              new Brackets((qq) => {
                qq.where(
                  `(event.type = 'ScientificStudy' AND TRIM("event"."payload"::jsonb ->> 'url') like 'http%')`
                )
                  .orWhere(
                    ` (event.type = 'Patent' AND TRIM("event"."payload"::jsonb ->> 'source') like 'http%')`
                  )
                  .orWhere(
                    ` (event.type = 'Documentary' AND TRIM("event"."payload"::jsonb ->> 'website') like 'http%')`
                  )
                  .orWhere(
                    ` (event.type = 'Documentary' AND TRIM("event"."payload"::jsonb ->> 'website') = '')`
                  );
              })
            )

            .printSql();

          return q.getMany();
        })
        // fp.TE.map(([ev]) => ev)
      ),
    }),
    fp.TE.chain(({ creator, events }) =>
      pipe(
        events.map((e) => {
          ctx.logger.debug.log("Found %s (%s) => %O", e.id, e.type, e.payload);
          return pipe(
            () => {
              switch (e.type) {
                case "ScientificStudy": {
                  return (e.payload as any).url;
                }
                case "Patent": {
                  return (e.payload as any).source;
                }
                case "Documentary": {
                  return (e.payload as any).website;
                }
              }
            },
            fp.TE.fromIO,
            fp.TE.chain((url) =>
              url ? fetchAndSave(ctx)(creator, url) : fp.TE.right(undefined)
            ),
            fp.TE.map((l) => {
              if (!l) {
                return { ...e, payload: { ...e.payload, website: undefined } };
              }

              switch (e.type) {
                case "Documentary": {
                  return { ...e, payload: { ...e.payload, website: l.id } };
                }
                case "Patent": {
                  return { ...e, payload: { ...e.payload, source: l.id } };
                }
                case "ScientificStudy":
                default: {
                  return { ...e, payload: { ...e.payload, url: l.id } };
                }
              }
            }),
            fp.TE.chain((ev) => ctx.db.save(EventV2Entity, [ev])),
            fp.TE.map(([e]) => {
              ctx.logger.debug.log(
                "Updated event %s (%s) => %O",
                e.id,
                e.type,
                e.payload
              );
              return e;
            })
          );
        }),
        fp.A.sequence(fp.TE.ApplicativeSeq)
      )
    ),
    throwTE
  );

  pipe(
    events,
    fp.A.map((e) =>
      ctx.logger.debug.log(
        "Updated event %s (%s) => %O",
        e.id,
        e.type,
        e.payload
      )
    )
  );

  await stopContext(ctx);
};

// eslint-disable-next-line no-console
void run().then(console.log).catch(console.error);
