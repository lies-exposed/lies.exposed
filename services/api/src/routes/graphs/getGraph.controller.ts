import * as fs from "fs";
import * as path from "path";
import { endpoints, AddEndpoint } from "@econnessione/shared/endpoints";
import { Router } from "express";
import * as E from "fp-ts/lib/Either";
import * as IOE from "fp-ts/lib/IOEither";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/pipeable";
import { RouteContext } from "routes/route.types";
import { IOError } from "ts-shared/lib/errors";

const readFile = (id: string): TE.TaskEither<Error, string> =>
  TE.fromIOEither(
    IOE.tryCatch(
      () =>
        fs
          .readFileSync(path.join(process.cwd(), "data", `${id}.json`), {
            encoding: "utf-8",
          })
          .toString(),
      E.toError
    )
  );

export const MakeGraphsRoute = (r: Router, ctx: RouteContext): void => {
  AddEndpoint(r)(endpoints.Graph.GetGraph, ({ params: { id } }) => {
    return pipe(
      readFile(id),
      TE.mapLeft(
        (e) =>
          new IOError("Couln't read file", {
            kind: "ServerError",
            status: "500",
            meta: e,
          })
      ),
      TE.map((data) => ({
        body: {
          data: JSON.parse(data),
        },
        statusCode: 200,
      }))
    );
  });
};
