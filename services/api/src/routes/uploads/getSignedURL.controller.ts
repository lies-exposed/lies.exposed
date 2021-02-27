import * as endpoints  from "@econnessione/shared/endpoints";
import { Router } from "express";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/pipeable";
import { RouteContext } from "routes/route.types";
import { AddEndpoint } from "ts-endpoint-express";

export const MakeSignedUrlRoute = (r: Router, ctx: RouteContext): void => {
  AddEndpoint(r)(
    endpoints.Uploads.GetSignedURL,
    ({ body: { Bucket, Key, ContentType } }) => {
      return pipe(
        ctx.s3.getSignedUrl("putObject", {
          Bucket,
          Key,
          ContentType,
        }),
        TE.map((data) => ({
          body: {
            data,
          },
          statusCode: 200,
        }))
      );
    }
  );
};
