import { EventV2Entity } from "@liexp/backend/lib/entities/Event.v2.entity.js";
import { fetchAndSave } from "@liexp/backend/lib/flows/links/link.flow.js";
import { getOneAdminOrFail } from "@liexp/backend/lib/flows/user/getOneUserOrFail.flow.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { type URL } from "@liexp/shared/lib/io/http/Common/URL.js";
import { type DocumentaryPayload } from "@liexp/shared/lib/io/http/Events/Documentary.js";
import { type PatentPayload } from "@liexp/shared/lib/io/http/Events/Patent.js";
import { type ScientificStudyPayload } from "@liexp/shared/lib/io/http/Events/ScientificStudy.js";
import { throwTE } from "@liexp/shared/lib/utils/task.utils.js";
import { sequenceS } from "fp-ts/lib/Apply.js";
import { Brackets } from "typeorm";
import { type CommandFlow } from "./command.type.js";
/**
 * Usage update-event-payload-url-refs
 *
 *
 * @returns void
 */
export const updateEventPayloadURLRefs: CommandFlow = async (ctx) => {
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
                  `(event.type = 'ScientificStudy' AND TRIM("event"."payload"::jsonb ->> 'url') like 'http%')`,
                )
                  .orWhere(
                    ` (event.type = 'Patent' AND TRIM("event"."payload"::jsonb ->> 'source') like 'http%')`,
                  )
                  .orWhere(
                    ` (event.type = 'Documentary' AND TRIM("event"."payload"::jsonb ->> 'website') like 'http%')`,
                  )
                  .orWhere(
                    ` (event.type = 'Documentary' AND TRIM("event"."payload"::jsonb ->> 'website') = '')`,
                  );
              }),
            )

            .printSql();

          return q.getMany();
        }),
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
                  const payload = e.payload as ScientificStudyPayload;
                  return payload.url as unknown as string | undefined;
                }
                case "Patent": {
                  const payload = e.payload as PatentPayload;
                  return payload.source as unknown as string | undefined;
                }
                case "Documentary": {
                  const payload = e.payload as DocumentaryPayload;
                  return payload.website as unknown as string | undefined;
                }
                default: {
                  return undefined;
                }
              }
            },
            fp.TE.fromIO,
            fp.TE.chain((url) =>
              url
                ? fetchAndSave(creator, url as unknown as URL)(ctx)
                : fp.TE.right(undefined),
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
                e.payload,
              );
              return e;
            }),
          );
        }),
        fp.A.sequence(fp.TE.ApplicativeSeq),
      ),
    ),
    throwTE,
  );

  pipe(
    events,

    fp.A.map((e): void => {
      ctx.logger.debug.log(
        "Updated event %s (%s) => %O",
        e.id,
        e.type,
        e.payload,
      );
    }),
  );
};
