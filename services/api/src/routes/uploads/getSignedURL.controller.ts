import { pipe } from "@liexp/core/lib/fp/index.js";
import { GetSignedURL } from "@liexp/shared/lib/endpoints/upload.endpoints.js";
import { uuid } from "@liexp/shared/lib/io/http/Common/UUID.js";
import { fileExtFromContentType } from "@liexp/shared/lib/utils/media.utils.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { AddEndpoint } from "#routes/endpoint.subscriber.js";
import { type Route } from "#routes/route.types.js";

export const MakeSignedUrlRoute: Route = (r, ctx) => {
  AddEndpoint(r)(
    GetSignedURL,
    ({ body: { resource, resourceId, ContentType, ContentLength } }) => {
      return pipe(
        ctx.s3.getSignedUrl({
          Bucket: ctx.env.SPACE_BUCKET,
          Key: `${resource}/${resourceId}/${uuid()}.${fileExtFromContentType(
            ContentType,
          )}`,
          ACL: "public-read",
          ContentType,
          ContentLength,
        }),
        TE.map((url) => ({
          body: {
            data: { id: resourceId, url },
          },
          statusCode: 200,
        })),
      );
    },
  );
};
