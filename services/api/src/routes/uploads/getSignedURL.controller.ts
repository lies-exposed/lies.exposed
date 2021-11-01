import { AddEndpoint } from "@econnessione/shared/endpoints";
import { GetSignedURL } from "@econnessione/shared/endpoints/upload.endpoints";
import { uuid } from "@econnessione/shared/utils/uuid";
import { Router } from "express";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/pipeable";
import { RouteContext } from "routes/route.types";

const fileExtFromContentType = (c: string): string => {
  if (c === "image/jpeg") {
    return "jpg";
  }

  if (c === "image/png") {
    return "png";
  }

  return "jpg";
};

export const MakeSignedUrlRoute = (r: Router, ctx: RouteContext): void => {
  AddEndpoint(r)(
    GetSignedURL,
    ({ body: { resource, resourceId, ContentType } }) => {
      return pipe(
        ctx.s3.getSignedUrl("putObject", {
          Bucket: ctx.env.SPACE_BUCKET,
          Key: `${resource}/${resourceId}/${uuid()}.${fileExtFromContentType(
            ContentType
          )}`,
          ContentType,
          ACL: "public-read",
        }),
        TE.map((url) => ({
          body: {
            data: { url },
          },
          statusCode: 200,
        }))
      );
    }
  );
};
