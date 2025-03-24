/* eslint-disable @typescript-eslint/no-misused-promises */
import { upload } from "@liexp/backend/lib/flows/space/upload.flow.js";
import { pipe } from "@liexp/core/lib/fp/index.js";
import { DecodeError } from "@liexp/shared/lib/io/http/Error/DecodeError.js";
import { PngType } from "@liexp/shared/lib/io/http/Media/MediaType.js";
import * as bodyParser from "body-parser";
import { Schema } from "effect";
import * as T from "fp-ts/lib/Task.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { type Route } from "#routes/route.types.js";
// import multer from 'multer';
// const uploads = multer({ dest: '../../media'})

const UploadFileData = Schema.Struct({ key: Schema.String, file: Schema.Any });

export const MakeUploadFileRoute: Route = (r, ctx) => {
  r.put(
    "/uploads/:key",
    // uploads.single('media'),
    bodyParser.default.urlencoded({
      extended: false,
      // 2 GB
      limit: 2048 * 1000 * 1000,
      type: ["image/jpeg", PngType.Type],
    }),
    async (req, res) => {
      ctx.logger.debug.log("Req %O", req);
      const key = req.params.key;
      const file = req.body;
      ctx.logger.debug.log("Key %O", key);
      ctx.logger.debug.log("body %O", req.body);
      ctx.logger.debug.log("File %O", req.files);

      return pipe(
        { key, file },
        Schema.decodeUnknownEither(UploadFileData),
        TE.fromEither,
        TE.mapLeft((e) =>
          DecodeError.of(`Failed to decode upload file data (${key})`, e),
        ),
        TE.chain(({ key, file }) =>
          upload({
            Bucket: ctx.env.SPACE_BUCKET,
            Key: `public/${key}`,
            Body: file,
          })(ctx),
        ),
        TE.map((data) => ({
          body: {
            data,
          },
          statusCode: 200,
        })),
        TE.fold(
          (e) => T.of(res.status(500).send(e)),
          ({ body, statusCode }) => T.of(res.status(statusCode).send(body)),
        ),
      )();
    },
  );
};
