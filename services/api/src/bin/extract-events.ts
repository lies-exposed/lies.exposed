import { EventV2Entity } from "@liexp/backend/lib/entities/Event.v2.entity.js";
import {
  extractEventFromURL,
  type DataPayloadLink,
} from "@liexp/backend/lib/flows/event/extractFromURL.flow.js";
import { getOneAdminOrFail } from "@liexp/backend/lib/flows/user/getOneUserOrFail.flow.js";
import { findByURL } from "@liexp/backend/lib/queries/events/scientificStudy.query.js";
import { throwTE } from "@liexp/shared/lib/utils/task.utils.js";
import { sequenceS } from "fp-ts/lib/Apply.js";
import * as A from "fp-ts/lib/Array.js";
import * as O from "fp-ts/lib/Option.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { pipe } from "fp-ts/lib/function.js";
import { type CommandFlow } from "./command.type.js";
import {
  toControllerError,
  type ControllerError,
} from "#io/ControllerError.js";

export const extractEvents: CommandFlow = async (ctx, args) => {
  const [url] = args;

  if (!url || url === "") {
    throw new Error("Missing url to fetch");
  }

  const result = await pipe(
    sequenceS(TE.ApplicativePar)({
      user: getOneAdminOrFail(ctx),
      browser: pipe(
        ctx.puppeteer.getBrowser({
          headless: true,
        }),
        TE.mapLeft(toControllerError),
      ),
    }),
    TE.chainTaskK(({ browser: b, user }) => {
      return pipe(
        TE.tryCatch(() => b.pages().then((pp) => pp[0]), toControllerError),
        TE.chain((p) => {
          return pipe(
            [{ url: url, type: "link" }] as unknown as DataPayloadLink[],
            A.traverse(TE.ApplicativeSeq)((l) =>
              pipe(
                extractEventFromURL(p, user, l)(ctx),
                TE.chain(
                  (
                    ev,
                  ): TE.TaskEither<
                    ControllerError,
                    [O.Option<DataPayloadLink>, O.Option<EventV2Entity>]
                  > => {
                    if (O.isNone(ev)) {
                      return TE.right([O.some(l), O.none]);
                    }
                    return pipe(
                      findByURL(l.url)(ctx),
                      TE.chain((opt) => {
                        if (O.isSome(opt)) {
                          ctx.logger.debug.log("Event found! %O", opt.value);
                          return TE.right(opt.value);
                        }

                        return pipe(
                          ctx.db.save(EventV2Entity, [ev.value]),
                          TE.map((ss) => ss[0]),
                        );
                      }),
                      TE.map((s) => [O.none, O.some(s)]),
                    );
                  },
                ),
              ),
            ),
            TE.map((ev) => {
              return ev.reduce(
                (acc, [l, e]) => {
                  const newAcc = {
                    ...acc,
                  };
                  if (O.isSome(l)) {
                    newAcc.failed.push(l.value);
                  }

                  if (O.isSome(e)) {
                    newAcc.succeed.push(e.value);
                  }

                  return newAcc;
                },
                {
                  total: ev.length,
                  failed: [] as DataPayloadLink[],
                  succeed: [] as EventV2Entity[],
                },
              );
            }),
          );
        }),
        TE.fold(
          (e) => async () => {
            ctx.logger.error.log("An Error occurred %O", e);
            await b.close();
            return {
              total: 0,
              failed: [],
              succeed: [],
            };
          },
          (r) => async () => {
            await b.close();
            return r;
          },
        ),
      );
    }),
    throwTE,
  );

  ctx.logger.info.log("Output: %O", result);
};
