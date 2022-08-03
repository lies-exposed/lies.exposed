import { EventV2Entity } from "@entities/Event.v2.entity";
import {
  DataPayload,
  DataPayloadLink,
  extractFromURL
} from "@flows/events/extractFromURL.flow";
import { ControllerError, toControllerError } from "@io/ControllerError";
import { throwTE } from "@liexp/shared/utils/task.utils";
import dotenv from "dotenv";
import * as A from "fp-ts/lib/Array";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import * as TE from "fp-ts/lib/TaskEither";
import * as fs from "fs";
import * as path from "path";
import { findByURL } from '../src/queries/events/scientificStudy.query';
import { makeContext } from "../src/server";

const run = async () => {
  const [, , configFile] = process.argv;

  const json: DataPayload = pipe(
    fs.readFileSync(path.resolve(process.cwd(), configFile), "utf-8"),
    JSON.parse
  );

  dotenv.config();

  const ctx = await throwTE(
    makeContext({ ...process.env, TG_BOT_POLLING: "false" })
  );

  const result = await pipe(
    ctx.puppeteer.getBrowser({
      headless: false,
    }),
    TE.mapLeft(toControllerError),
    TE.chainTaskK((b) => {
      return pipe(
        TE.tryCatch(() => b.pages().then((pp) => pp[0]), toControllerError),
        TE.chain((p) => {
          return pipe(
            json.links,
            A.traverse(TE.ApplicativeSeq)((l) =>
              pipe(
                extractFromURL(ctx)(p, l),
                TE.chain(
                  (
                    ev
                  ): TE.TaskEither<
                    ControllerError,
                    [O.Option<DataPayloadLink>, O.Option<EventV2Entity>]
                  > => {
                    if (ev._tag === "None") {
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
