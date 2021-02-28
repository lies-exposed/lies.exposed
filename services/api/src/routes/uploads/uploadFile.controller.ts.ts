/* eslint-disable @typescript-eslint/no-misused-promises */
import { DecodeError } from "@io/ControllerError";
import { RouteContext } from "@routes/route.types";
import { Router } from "express";
import * as E from "fp-ts/lib/Either";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/pipeable";
import * as t from "io-ts";
import multer from "multer";
import { v4 as uuid } from "uuid";

const UploadFileBody = t.strict({
  resource: t.union([t.literal("events"), t.literal("actors")]),
  resourceId: t.string,
});


export const MakeUploadFileRoute = (r: Router, ctx: RouteContext): void => {
  r.post("/uploads", multer().single("file"), async (req, res) => {
    ctx.logger.debug.log("Body %O", req.file);

    return await pipe(
      UploadFileBody.decode(req.body),
      E.mapLeft(DecodeError),
      TE.fromEither,
      TE.chain(({ resource, resourceId }) =>
        ctx.s3.upload({
          Bucket: ctx.env.SPACE_BUCKET,
          Key: `${resource}/${resourceId}/${uuid()}.jpg`,
          Body: req.file.buffer,
          ContentType: req.file.mimetype,
        })
      ),
      TE.map((data) => ({
        body: {
          data,
        },
        statusCode: 200,
      })),
      TE.fold(
        (e) => {
          return () => Promise.resolve(res.send(500).send(e));
        },
        (body) => {
          return () => Promise.resolve(res.status(201).send(body));
        }
      )
    )();
  });
};
