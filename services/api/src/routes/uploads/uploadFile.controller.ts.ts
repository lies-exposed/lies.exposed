/* eslint-disable @typescript-eslint/no-misused-promises */
import { DecodeError } from "@io/ControllerError";
import { RouteContext } from "@routes/route.types";
import * as bodyParser from "body-parser";
import { Router } from "express";
import * as T from "fp-ts/lib/Task";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/pipeable";
import * as t from "io-ts";
// import multer from 'multer';
// const uploads = multer({ dest: '../../media'})

const UploadFileData = t.strict({ key: t.string, file: t.any });

export const MakeUploadFileRoute = (r: Router, ctx: RouteContext): void => {
  r.put(
    "/v1/uploads/*",
    // uploads.single('media'),
    bodyParser.urlencoded({
      extended: false,
      limit: 2048 * 1000,
      type: "image/jpeg",
    }),
    async (req, res) => {
      ctx.logger.debug.log("Req %O", req);
      const key = req.params[0];
      const file = req.body;
      ctx.logger.debug.log("Key %O", key);
      ctx.logger.debug.log("body %O", req.body);
      ctx.logger.debug.log("File %O", req.files);

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
          (e) => T.task.of(res.status(500).send(e)),
          ({ body, statusCode }) => T.task.of(res.status(statusCode).send(body))
        )
      )();
    }
  );
};
