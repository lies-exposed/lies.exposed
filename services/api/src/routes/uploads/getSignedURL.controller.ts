import { AddEndpoint } from "@liexp/shared/endpoints";
import { GetSignedURL } from "@liexp/shared/endpoints/upload.endpoints";
import { fileExtFromContentType } from "@liexp/shared/utils/media.utils";
import { uuid } from "@liexp/shared/utils/uuid";
import { type Router } from "express";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { type RouteContext } from "../route.types";

export const MakeSignedUrlRoute = (r: Router, ctx: RouteContext): void => {
  AddEndpoint(r)(
    GetSignedURL,
    ({ body: { resource, resourceId, ContentType } }) => {
      return pipe(
        ctx.s3.getSignedUrl({
          Bucket: ctx.env.SPACE_BUCKET,
          Key: `public/${resource}/${resourceId}/${uuid()}.${fileExtFromContentType(
            ContentType
          )}`,
          ResponseContentType: ContentType,
        }),
        TE.map((url) => ({
          body: {
            data: { id: resourceId, url },
          },
          statusCode: 200,
        }))
      );
    }
  );
};
