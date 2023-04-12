import { EventV2Entity } from "@entities/Event.v2.entity";
import {
  DataPayloadLink,
  extractFromURL
} from "@flows/events/extractFromURL.flow";
import { getOneAdminOrFail } from '@flows/users/getOneUserOrFail.flow';
import { ControllerError, toControllerError } from "@io/ControllerError";
import { throwTE } from "@liexp/shared/lib/utils/task.utils";
import dotenv from "dotenv";
import * as A from "fp-ts/Array";
import { pipe } from "fp-ts/function";
import { sequenceS } from "fp-ts/lib/Apply";
import * as O from "fp-ts/Option";
import * as TE from "fp-ts/TaskEither";
import { findByURL } from "../src/queries/events/scientificStudy.query";
import { makeContext } from "../src/server";

dotenv.config();

const run = async () => {
  const [, , url] = process.argv;

  if (!url || url === "") {
    throw new Error("Missing url to fetch");
  }

  const ctx = await throwTE(
    makeContext({ ...process.env, TG_BOT_POLLING: "false" })
  );

  const result = await pipe(
    sequenceS(TE.ApplicativePar)({
      user: getOneAdminOrFail(ctx),
      browser: pipe(
        ctx.puppeteer.getBrowser({
          headless: false,
        }),
        TE.mapLeft(toControllerError)
      ),
    }),
    TE.chainTaskK(({ browser: b, user }) => {
      return pipe(
        TE.tryCatch(() => b.pages().then((pp) => pp[0]), toControllerError),
        TE.chain((p) => {
          return pipe(
            [{ url: url as any, type: "link" }],
            A.traverse(TE.ApplicativeSeq)((l) =>
              pipe(
                extractFromURL(ctx)(p, user, l),
                TE.chain(
                  (
                    ev
                  ): TE.TaskEither<
                    ControllerError,
                    [O.Option<DataPayloadLink>, O.Option<EventV2Entity>]
                  > => {
                    if (O.isNone(ev)) {
                      return TE.right([O.some(l), O.none]);
                    }
                    return pipe(
                      findByURL(ctx)(l.url),
                      TE.chain((opt) => {
                        if (O.isSome(opt)) {
                          ctx.logger.debug.log("Event found! %O", opt.value);
                          return TE.right(opt.value);
                        }

                        return pipe(
                          ctx.db.save(EventV2Entity, [ev.value]),
                          TE.map((ss) => ss[0])
                        );
                      }),
                      TE.map((s) => [O.none, O.some(s)])
                    );
                  }
                )
              )
            ),
            TE.map((ev) => {
              return ev.reduce(
                (acc, [l, e]) => {
                  let newAcc = {
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
                }
              );
            })
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
          }
        )
      );
    })
  )();

  ctx.logger.info.log("Output: %O", result);
};

run().catch(console.error);
