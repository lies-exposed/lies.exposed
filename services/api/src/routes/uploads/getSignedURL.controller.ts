import { AddEndpoint } from "@liexp/shared/endpoints";
import { GetSignedURL } from "@liexp/shared/endpoints/upload.endpoints";
import { fileExtFromContentType } from "@liexp/shared/utils/media.utils";
import { uuid } from "@liexp/shared/utils/uuid";
import { Router } from "express";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/function";
import { RouteContext } from "../route.types";

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
