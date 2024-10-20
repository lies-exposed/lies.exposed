/* eslint-disable @typescript-eslint/no-misused-promises */
import { LoggerService } from "@liexp/backend/lib/services/logger/logger.service.js";
import { pipe } from "@liexp/core/lib/fp/index.js";
import { UploadResource } from "@liexp/shared/lib/endpoints/upload.endpoints.js";
import { getMediaKey } from "@liexp/shared/lib/utils/media.utils.js";
import { sequenceS } from "fp-ts/lib/Apply.js";
import * as T from "fp-ts/lib/Task.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import * as t from "io-ts";
import multer, { memoryStorage } from "multer";
import { upload } from "#flows/space/upload.flow.js";
import { DecodeError, toControllerError } from "#io/ControllerError.js";
import { type Route } from "#routes/route.types.js";

const UploadFileData = t.strict({ key: t.string, resource: UploadResource });

export const MakeUploadMultipartFileRoute: Route = (r, ctx): void => {
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
        sequenceS(TE.ApplicativePar)({
          file: pipe(
            req.file,
            TE.fromPredicate(
              (f): f is Express.Multer.File => f !== undefined,
              () => toControllerError(new Error("No file given")),
            ),
          ),
          body: pipe(
            UploadFileData.decode({ key, resource }),
            TE.fromEither,
            TE.mapLeft((e) =>
              DecodeError(`Failed to decode upload file data (${key})`, e),
            ),
          ),
        }),
        TE.chain(({ body, file }) =>
          upload({
            Bucket: ctx.env.SPACE_BUCKET,
            Key: getMediaKey(
              body.resource,
              body.key,
              body.key,
              file.mimetype as any,
            ),
            ACL: "public-read",
            Body: file.buffer,
          })(ctx),
        ),
        LoggerService.TE.debug(ctx, `Upload results %O`),
        TE.map((data) => ({
          body: {
            data,
          },
          statusCode: 201,
        })),
        TE.fold(
          (e) => T.of(res.status(500).send(e)),
          ({ statusCode, body }) => T.of(res.status(statusCode).send(body)),
        ),
      )();
    },
  );
};
