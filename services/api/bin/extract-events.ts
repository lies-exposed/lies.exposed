import { EventV2Entity } from "@entities/Event.v2.entity";
import { extractFromURL } from "@flows/events/extractFromURL.flow";
import { fetchAndSave } from "@flows/link.flow";
import { ControllerError, toControllerError } from "@io/ControllerError";
import { URL } from "@liexp/shared/io/http/Common";
import { ScientificStudy } from "@liexp/shared/io/http/Events";
import { throwTE } from "@liexp/shared/utils/task.utils";
import { searchEventV2Query } from "@routes/events/queries/searchEventsV2.query";
import dotenv from "dotenv";
import * as A from "fp-ts/lib/Array";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import * as TE from "fp-ts/lib/TaskEither";
import * as fs from "fs";
import * as path from "path";
import { makeContext } from "../src/server";

interface DataPayloadLink {
  url: URL;
  type: string;
}
interface DataPayload {
  keywords: string[];
  links: DataPayloadLink[];
}

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
            A.traverse(TE.ApplicativeSeq)((l) => {
              return pipe(
                fetchAndSave(ctx)(l.url),
                TE.chain((le) =>
                  pipe(
                    extractFromURL(ctx)(p, le),
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
                          searchEventV2Query(ctx)({
                            title: O.fromNullable(
                              (ev.value.payload as any).title
                            ),
                            exclude: O.none,
                            skip: 0,
                            take: 1,
                            startDate: O.none,
                            endDate: O.none,
                            links: O.some([le.id]),
                            keywords: O.none,
                            media: O.none,
                            actors: O.none,
                            groups: O.none,
                            groupsMembers: O.none,
                            draft: O.none,
                            withDrafts: true,
                            withDeleted: true,
                            locations: O.none,
                            type: O.some([
                              ScientificStudy.SCIENTIFIC_STUDY.value,
                            ]),
                          }),
                          TE.chain((opt) => {
                            if (opt.results.length > 0) {
                              ctx.logger.debug.log(
                                "Event found! %O",
                                opt.results[0].id
                              );
                              return TE.right(opt.results[0]);
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
                )
              );
            }),
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
