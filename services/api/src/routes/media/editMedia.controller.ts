import { MediaIO } from "@liexp/backend/lib/io/media.io.js";
import { pipe } from "@liexp/core/lib/fp/index.js";
import { Endpoints } from "@liexp/shared/lib/endpoints/api/index.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { editMedia } from "#flows/media/editMedia.flow.js";
import { AddEndpoint } from "#routes/endpoint.subscriber.js";
import { type Route } from "#routes/route.types.js";

export const MakeEditMediaRoute: Route = (r, ctx) => {
  AddEndpoint(r)(Endpoints.Media.Edit, ({ params: { id }, body }) => {
    return pipe(
      editMedia(id, body)(ctx),
      TE.chain((media) =>
        TE.fromEither(
          MediaIO.decodeSingle({
            ...media,
            creator: media.creator,
          }),
        ),
      ),
      TE.map((data) => ({
        body: {
          data,
        },
        statusCode: 200,
      })),
    );
  });
};
