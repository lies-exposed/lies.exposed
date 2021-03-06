/* eslint-disable @typescript-eslint/no-misused-promises */
// import * as path from "path";
import { DecodeError } from "@io/ControllerError";
import { RouteContext } from "@routes/route.types";
import { Router } from "express";
import * as T from "fp-ts/lib/Task";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/pipeable";
import * as t from "io-ts";
// import multer from "multer";


const UploadFileData = t.strict({ key: t.string, file: t.any });
// const uploads = multer({ dest: path.resolve(__dirname, "../../../data") });

export const MakeUploadFileRoute = (r: Router, ctx: RouteContext): void => {
  r.put("/v1/uploads/*", async (req, res) => {
    ctx.logger.debug.log("Req %O", req);
    const key = req.params[0];
    const file = req.body;
    ctx.logger.debug.log("Key %O", key);
    ctx.logger.debug.log("File %O", file);

    return await pipe(
      UploadFileData.decode({ key, file }),
      TE.fromEither,
      TE.mapLeft(DecodeError),
      TE.chain(({ key, file }) =>
        ctx.s3.upload({
          Bucket: ctx.env.SPACE_BUCKET,
          Key: key,
          Body: file,
        })
      ),
      TE.map((data) => ({
        body: {
          data,
        },
        statusCode: 200,
      })),
      TE.fold(
        (e) => T.task.of(res.send(500).send(e)),
        ({ body, statusCode }) => T.task.of(res.status(statusCode).send(body))
      )
    )();
  });
};
