/* eslint-disable @typescript-eslint/no-misused-promises */
import { pipe, fp } from "@liexp/core/lib/fp/index.js";
import { UploadResource } from "@liexp/shared/lib/endpoints/upload.endpoints.js";
import { getMediaKey } from "@liexp/shared/lib/utils/media.utils.js";
import { type Router } from "express";
import { sequenceS } from "fp-ts/Apply";
import * as t from "io-ts";
import multer, { memoryStorage } from "multer";
import { DecodeError, toControllerError } from "#io/ControllerError.js";
import { type RouteContext } from "#routes/route.types.js";

const UploadFileData = t.strict({ key: t.string, resource: UploadResource });

export const MakeUploadMultipartFileRoute = (
  r: Router,
  ctx: RouteContext,
): void => {
  const uploads = multer({
    storage: memoryStorage(),
    // dest: ctx.fs.resolve("temp/uploads"),
  });

  r.put(
    "/uploads-multipart/:key",
    uploads.single("media"),
    async (req, res) => {
      ctx.logger.debug.log("Req %O", req);
      const key = req.params.key;
      const resource = req.body.resource;
      ctx.logger.debug.log("Key %O", key);
      ctx.logger.debug.log("body %O", req.body);
      ctx.logger.debug.log("File %O", req.file);

      return pipe(
        sequenceS(fp.TE.ApplicativePar)({
          file: pipe(
            req.file,
            fp.TE.fromPredicate(
              (f): f is Express.Multer.File => f !== undefined,
              () => toControllerError(new Error("No file given")),
            ),
          ),
          body: pipe(
            UploadFileData.decode({ key, resource }),
            fp.TE.fromEither,
            fp.TE.mapLeft((e) =>
              DecodeError(`Failed to decode upload file data (${key})`, e),
            ),
          ),
        }),
        fp.TE.chain(({ body, file }) =>
          ctx.s3.upload({
            Bucket: ctx.env.SPACE_BUCKET,
            Key: getMediaKey(
              body.resource,
              body.key,
              body.key,
              file.mimetype as any,
            ),
            ACL: "public-read",
            Body: file.buffer,
          }),
        ),
        ctx.logger.debug.logInTaskEither(`Upload results %O`),
        fp.TE.map((data) => ({
          body: {
            data,
          },
          statusCode: 201,
        })),
        fp.TE.fold(
          (e) => fp.T.of(res.status(500).send(e)),
          ({ statusCode, body }) => fp.T.of(res.status(statusCode).send(body)),
        ),
      )();
    },
  );
};
