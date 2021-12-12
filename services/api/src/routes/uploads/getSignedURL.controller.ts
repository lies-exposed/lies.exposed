import { AddEndpoint } from "@econnessione/shared/endpoints";
import {
  GetSignedURL,
  ValidContentType,
} from "@econnessione/shared/endpoints/upload.endpoints";
import * as Media from "@econnessione/shared/io/http/Media";
import { uuid } from "@econnessione/shared/utils/uuid";
import { Router } from "express";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/pipeable";
import { RouteContext } from "../route.types";

const fileExtFromContentType = (c: ValidContentType): string => {
  switch (c) {
    case Media.MediaType.types[4].value:
      return "pdf";
    case Media.MediaType.types[3].value:
      return "mp4";
    case Media.MediaType.types[2].value:
      return "png";
    case Media.MediaType.types[1].value:
      return "jpeg";
    case Media.MediaType.types[0].value:
      return "jpg";
  }
};

export const MakeSignedUrlRoute = (r: Router, ctx: RouteContext): void => {
  AddEndpoint(r)(
    GetSignedURL,
    ({ body: { resource, resourceId, ContentType } }) => {
      return pipe(
        ctx.s3.getSignedUrl("putObject", {
          Bucket: ctx.env.SPACE_BUCKET,
          Key: `public/${resource}/${resourceId}/${uuid()}.${fileExtFromContentType(
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
